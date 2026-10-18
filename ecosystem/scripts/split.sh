#!/usr/bin/env bash
# Split ecosystem/<Org>/<repo> into a standalone branch split/<Org>/<repo>,
# preserving its history, ready to push to github.com/<Org>/<repo>.
#
#   ecosystem/scripts/split.sh SHD-CCP/geometric-engine-spec
set -euo pipefail

target="${1:?usage: $0 <Org>/<repo>}"
root="$(git rev-parse --show-toplevel)"
prefix="ecosystem/${target}"

if [[ ! -d "${root}/${prefix}" ]]; then
  echo "no such folder: ${prefix}" >&2
  exit 1
fi

branch="split/${target}"
git -C "${root}" subtree split --prefix="${prefix}" -b "${branch}"
echo
echo "Created ${branch}. Push it with:"
echo "  git push git@github.com:${target}.git ${branch}:main"
