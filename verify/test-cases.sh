#!/bin/sh
# Cases for verify-p2pool-release.sh: test-cases.sh <release-tag> <signer-fingerprint>.
# Run by verify/test.sh inside the builder base image; expects /src to be the repo (read-only) and network access.
set -eu

VERSION="$1"
FPR="$2"
VERIFY="sh /src/verify/verify-p2pool-release.sh"
KEY="/src/assets/release-keys/${FPR}.asc"
ASSET="p2pool-${VERSION}-linux-x64.tar.gz"
BASE_URL="https://github.com/SChernykh/p2pool/releases/download/${VERSION}"

W="$(mktemp -d)"
cd "$W"
wget -q "${BASE_URL}/${ASSET}" -O "real-${ASSET}"
wget -q "${BASE_URL}/sha256sums.txt.asc" -O real.asc

PASS=0
FAILED=0

# expect <pass|fail> <description> <key> <fpr> <asc> <tarball-source>
# The tarball is copied to its release file name so the lookup by name works.
expect() {
  want="$1"; desc="$2"; key="$3"; fpr="$4"; asc="$5"; tarball="$6"
  rm -rf case && mkdir case && cp "$tarball" "case/${ASSET}"
  if $VERIFY "$key" "$fpr" "$asc" "case/${ASSET}" >case.log 2>&1; then got=pass; else got=fail; fi
  if [ "$got" = "$want" ]; then
    PASS=$((PASS + 1)); echo "ok   - $desc (expected $want)"
    if [ "${VERBOSE:-0}" = 1 ]; then sed "s/^/       /" case.log; fi
  else
    FAILED=$((FAILED + 1)); echo "FAIL - $desc (expected $want, got $got)"; sed 's/^/       /' case.log
  fi
}

# flip_byte <in> <out> <line-number>: change the 12th character of that line.
flip_byte() {
  awk -v n="$3" '
    NR == n {
      c = substr($0, 12, 1); r = (c == "a") ? "b" : "a"
      $0 = substr($0, 1, 11) r substr($0, 13)
    }
    { print }
  ' "$1" >"$2"
  ! cmp -s "$1" "$2"
}

# --- inputs -----------------------------------------------------------------

# One changed byte in the signed text: this asset's SHA256 line.
LINE_NO="$(grep -n -x -F "Name: ${ASSET}" real.asc | cut -d: -f1)"
awk -v start="$LINE_NO" '
  NR > start && !done && $1 == "SHA256:" {
    c = substr($2, 1, 1); r = (c == "a") ? "b" : "a"
    $0 = "SHA256: " r substr($2, 2); done = 1
  }
  { print }
' real.asc >tampered-text.asc
if cmp -s real.asc tampered-text.asc; then echo "setup: SHA256 line was not changed" >&2; exit 1; fi

# One changed byte inside the signature block. The armor CRC line is dropped first so
# gpg reaches the signature check and reports BADSIG instead of stopping at a CRC error.
SIG_LINE_NO="$(( $(grep -n 'BEGIN PGP SIGNATURE' real.asc | cut -d: -f1) + 3 ))"
grep -v '^=' real.asc >real-nocrc.asc
flip_byte real-nocrc.asc tampered-sig.asc "$SIG_LINE_NO"

# A substituted tarball (one changed byte at offset 1000).
cp "real-${ASSET}" evil.tar.gz
printf 'X' | dd of=evil.tar.gz bs=1 seek=1000 conv=notrunc 2>/dev/null
if cmp -s "real-${ASSET}" evil.tar.gz; then echo "setup: tarball was not changed" >&2; exit 1; fi

# An unsigned entry for the substituted tarball placed above the signed block.
EVIL_SUM="$(sha256sum evil.tar.gz | cut -d' ' -f1)"
{ printf 'Name: %s\nSHA256: %s\n\n' "$ASSET" "$EVIL_SUM"; cat real.asc; } >prefixed.asc

# A different key, and the same checksum text signed with it.
export GNUPGHOME="$W/otherkey"
mkdir -m 700 "$GNUPGHOME"
gpg --batch --quiet --passphrase '' --quick-gen-key 'Not Upstream <not-upstream@example.invalid>' ed25519 sign never 2>/dev/null
OTHER_FPR="$(gpg --batch --with-colons --list-keys | awk -F: '$1 == "fpr" { print $10; exit }')"
gpg --batch --quiet --armor --export "$OTHER_FPR" >other.asc
GNUPGHOME="$W/upstream" sh -c 'mkdir -m 700 "$GNUPGHOME" && gpg --batch --quiet --import "$1" 2>/dev/null && gpg --batch --decrypt real.asc 2>/dev/null' sh "$KEY" >signed.txt
gpg --batch --quiet --clearsign --output other-signed.asc signed.txt
unset GNUPGHOME

# --- cases ------------------------------------------------------------------

expect pass "real release, pinned key"                           "$KEY"     "$FPR"       real.asc            "real-${ASSET}"
expect fail "one changed byte in the signed checksum text"       "$KEY"     "$FPR"       tampered-text.asc   "real-${ASSET}"
expect fail "one changed byte in the signature block"            "$KEY"     "$FPR"       tampered-sig.asc    "real-${ASSET}"
expect fail "substituted tarball"                                "$KEY"     "$FPR"       real.asc            evil.tar.gz
expect fail "unsigned entry above the signed block"              "$KEY"     "$FPR"       prefixed.asc        evil.tar.gz
expect fail "checksums signed by another key, pinned key file"   "$KEY"     "$FPR"       other-signed.asc    "real-${ASSET}"
expect fail "other key file offered under the pinned fingerprint" other.asc "$FPR"       other-signed.asc    "real-${ASSET}"
expect fail "real release checked against another key"           other.asc  "$OTHER_FPR" real.asc            "real-${ASSET}"
# Control: the harness can pass with a self-consistent other key, so the
# failures above come from the key pin and not from a broken setup.
expect pass "control: other key, its own fingerprint and signature" other.asc "$OTHER_FPR" other-signed.asc "real-${ASSET}"

echo "passed: $PASS  failed: $FAILED"
[ "$FAILED" -eq 0 ]
