#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
mkdir -p lib

checkout() {
  local directory="lib/$1" url="$2" revision="$3"
  if [[ -e "$directory" ]]; then
    if [[ -d "$directory/.git" ]] && [[ "$(git -C "$directory" rev-parse HEAD 2>/dev/null || true)" == "$revision" ]]; then
      return
    fi
    echo "Unexpected contents in $directory. Move it aside before setup." >&2
    exit 1
  fi

  local temp
  temp="$(mktemp -d "lib/$1.XXXXXX")"
  if git -C "$temp" init -q &&
     git -C "$temp" fetch --quiet --depth=1 "$url" "$revision" &&
     git -C "$temp" checkout -q --detach "$revision"; then
    mv "$temp" "$directory"
  else
    echo "Could not fetch $url at $revision into $temp" >&2
    exit 1
  fi
}

checkout v4-core https://github.com/Uniswap/v4-core.git 59d3ecf53afa9264a16bba0e38f4c5d2231f80bc
checkout v4-periphery https://github.com/Uniswap/v4-periphery.git c6e4754dab11bd38c6f08ac51c3c868569e93d64
checkout solmate https://github.com/transmissions11/solmate.git 4b47a19038b798b4a33d9749d25e570443520647
