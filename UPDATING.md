# Updating the upstream version

This package wraps [SChernykh/p2pool](https://github.com/SChernykh/p2pool). The
Dockerfile downloads the official prebuilt release binary and verifies it against
the signed `sha256sums.txt.asc` published with each release. "Upstream" means that
release.

## Determining the upstream version

Fetch the latest P2Pool release tag:

```sh
gh release view -R SChernykh/p2pool --json tagName -q .tagName
```

The current pin is `ARG P2POOL_VERSION` in `Dockerfile` (the release tag, e.g. `v4.17`).

## Applying the bump

1. Set `ARG P2POOL_VERSION` in `Dockerfile` to the new tag (keep the leading `v`).
2. Confirm the release still publishes `p2pool-<tag>-linux-x64.tar.gz` and
   `-linux-aarch64.tar.gz` assets plus `sha256sums.txt.asc`; the Dockerfile's
   download/verify step depends on those names.
