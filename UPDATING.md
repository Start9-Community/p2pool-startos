# Updating the upstream version

This package wraps [SChernykh/p2pool](https://github.com/SChernykh/p2pool). The
Dockerfile downloads the official prebuilt release binary and runs
`verify/verify-p2pool-release.sh`: the build fails unless `sha256sums.txt.asc`
carries a good signature by the pinned signing key and the tarball matches the
hash in the signed text. "Upstream" means that release.

## Determining the upstream version

Fetch the latest P2Pool release tag:

```sh
gh release view -R SChernykh/p2pool --json tagName -q .tagName
```

The current pin is `ARG P2POOL_VERSION` in `Dockerfile` (the release tag, e.g. `v4.17`).
The signer pin is `ARG P2POOL_SIGNER_FPR` beside it; the matching public key is
vendored as `assets/release-keys/<fingerprint>.asc`.

## Applying the bump

1. Set `ARG P2POOL_VERSION` in `Dockerfile` to the new tag (keep the leading `v`).
2. Confirm the release still publishes `p2pool-<tag>-linux-x64.tar.gz` and
   `-linux-aarch64.tar.gz` assets plus `sha256sums.txt.asc`; the Dockerfile's
   download/verify step depends on those names.
3. Run `verify/test.sh` (Docker + network). It must pass against the new release.

If a release is signed by a different key, do not take the new fingerprint from the
release page. Upstream's release notes point at two separately controlled copies of
the current key, both serving it since 2021:
[monero-project/gitian.sigs](https://github.com/monero-project/gitian.sigs/blob/master/gitian-pubkeys/SChernykh.asc)
and <https://p2pool.io/SChernykh.asc>. Confirm a new key the same way, then update
`ARG P2POOL_SIGNER_FPR` and replace the vendored key file in the same change.
