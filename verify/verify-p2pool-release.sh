#!/bin/sh
# Verify a P2Pool release tarball against upstream's signed checksum list.
#
# Usage: verify-p2pool-release.sh <key.asc> <fingerprint> <sha256sums.txt.asc> <tarball>
#
# 1. <key.asc> must hold exactly one public key, and its fingerprint must equal
#    <fingerprint>.
# 2. <sha256sums.txt.asc> must carry a good signature made by that key.
# 3. The SHA256 for <tarball> is read from the signed text only (never from the
#    raw armored file) and the tarball must match it.
# Exits non-zero, with a message on stderr, if any step fails.
set -eu

if [ "$#" -ne 4 ]; then
  echo "usage: $0 <key.asc> <fingerprint> <sha256sums.txt.asc> <tarball>" >&2
  exit 2
fi

KEY="$1"
FPR="$(printf '%s' "$2" | tr -d ' ' | tr 'a-f' 'A-F')"
SUMS="$3"
ASSET="$4"
NAME="$(basename "$ASSET")"

fail() {
  echo "verify-p2pool-release: $*" >&2
  exit 1
}

GNUPGHOME="$(mktemp -d)"
export GNUPGHOME
trap 'rm -rf "$GNUPGHOME"' EXIT

# 1. Import the key and confirm it is the pinned one and nothing else.
gpg --batch --quiet --import "$KEY" 2>/dev/null || fail "could not import $KEY"
PRIMARIES="$(gpg --batch --with-colons --list-keys \
  | awk -F: '$1 == "pub" { want = 1; next } want && $1 == "fpr" { print $10; want = 0 }')"
[ "$PRIMARIES" = "$FPR" ] \
  || fail "key file must hold only the pinned key $FPR; found: $(printf "%s" "$PRIMARIES" | tr "\n" " ")"

# 2. Check the signature and keep only the signed text.
STATUS="$GNUPGHOME/status"
SIGNED="$GNUPGHOME/signed.txt"
gpg --batch --status-fd 3 --output "$SIGNED" --decrypt "$SUMS" 3>"$STATUS" 2>/dev/null \
  || fail "signature check failed for $SUMS"
if grep -qE '^\[GNUPG:\] (BADSIG|ERRSIG|EXPSIG|EXPKEYSIG|REVKEYSIG|NO_PUBKEY)' "$STATUS"; then
  fail "signature on $SUMS is not a good signature by $FPR"
fi
# Positive check, and the one that rejects unsigned input: gpg exits 0 on an unsigned
# literal message with no BADSIG. VALIDSIG's last field is the signer's primary fingerprint.
awk -v fpr="$FPR" '$1 == "[GNUPG:]" && $2 == "VALIDSIG" && $NF == fpr { ok = 1 } END { exit !ok }' "$STATUS" \
  || fail "signature on $SUMS was not made by $FPR"

# 3. Look up the tarball's hash in the signed text and check the tarball.
EXPECTED="$(awk -v name="$NAME" '
  /^[[:space:]]*$/ { cur = ""; next }
  $1 == "Name:" { cur = $2; next }
  $1 == "SHA256:" && cur == name { print $2; n++ }
  END { if (n != 1) exit 1 }
' "$SIGNED")" || fail "no single SHA256 entry for $NAME in the signed checksum list"
printf '%s' "$EXPECTED" | grep -qE '^[0-9a-f]{64}$' \
  || fail "malformed SHA256 for $NAME: $EXPECTED"

printf '%s  %s\n' "$EXPECTED" "$ASSET" | sha256sum -c - >/dev/null 2>&1 \
  || fail "SHA256 mismatch for $NAME"

echo "verify-p2pool-release: OK $NAME (signed by $FPR)"
