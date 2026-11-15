#!/usr/bin/env bash
# Runs verify/test-cases.sh inside the Dockerfile's builder base image against the
# release and signer pinned by ARG P2POOL_VERSION / ARG P2POOL_SIGNER_FPR.
# Needs docker and network access. Usage: verify/test.sh   (VERBOSE=1 for case logs)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="$(awk -F= '/^ARG P2POOL_VERSION=/ { print $2; exit }' "$ROOT/Dockerfile")"
FPR="$(awk -F= '/^ARG P2POOL_SIGNER_FPR=/ { print $2; exit }' "$ROOT/Dockerfile")"
BASE="$(awk '/^FROM debian:bookworm-slim/ { print $2; exit }' "$ROOT/Dockerfile")"
if [ -z "$VERSION" ] || [ -z "$FPR" ] || [ -z "$BASE" ]; then
  echo "could not read version/signer/base from Dockerfile" >&2
  exit 2
fi

docker run --rm --platform linux/amd64 --memory=1g -v "$ROOT:/src:ro" "$BASE" sh -c '
  set -e
  apt-get update -qq >/dev/null
  apt-get install -y -qq --no-install-recommends wget ca-certificates gnupg >/dev/null
  VERBOSE="${3:-0}" sh /src/verify/test-cases.sh "$1" "$2"
' sh "$VERSION" "$FPR" "${VERBOSE:-0}"
