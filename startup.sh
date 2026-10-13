#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

if ! command -v npm >/dev/null 2>&1 || ! command -v node >/dev/null 2>&1; then
  echo "Node.js 22+ and npm are required. Install them, then run this script again." >&2
  exit 1
fi

config="$(node --input-type=module -e "
import { getServerConfig } from './server/config.js';
const config = getServerConfig();
const modelUrl = new URL(config.openAICompatible.baseUrl);
console.log([config.provider, modelUrl.origin, modelUrl.hostname, modelUrl.port, config.openAICompatible.model].join('|'));
")"
IFS='|' read -r provider model_origin model_host model_port model_name <<< "$config"

ollama_pid=""
cleanup() {
  if [[ -n "$ollama_pid" ]] && kill -0 "$ollama_pid" 2>/dev/null; then
    kill "$ollama_pid" 2>/dev/null || true
    wait "$ollama_pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

if [[ "$provider" == "openai-compatible" \
  && "$model_port" == "11434" \
  && ( "$model_host" == "localhost" || "$model_host" == "127.0.0.1" || "$model_host" == "::1" ) ]]; then
  if ! curl --silent --fail "$model_origin/api/tags" >/dev/null 2>&1; then
    if ! command -v ollama >/dev/null 2>&1; then
      echo "The configured local model uses Ollama, but the 'ollama' command is not installed." >&2
      exit 1
    fi
    echo "Starting Ollama..."
    ollama serve &
    ollama_pid=$!

    for _ in {1..30}; do
      if curl --silent --fail "$model_origin/api/tags" >/dev/null 2>&1; then
        break
      fi
      if ! kill -0 "$ollama_pid" 2>/dev/null; then
        echo "Ollama stopped before becoming ready. Check its installation and logs." >&2
        exit 1
      fi
      sleep 1
    done

    if ! curl --silent --fail "$model_origin/api/tags" >/dev/null 2>&1; then
      echo "Ollama did not become ready at $model_origin within 30 seconds." >&2
      exit 1
    fi
  else
    echo "Ollama is already running at $model_origin."
  fi

  if ! ollama list 2>/dev/null | awk 'NR > 1 { print $1 }' | grep --fixed-strings --line-regexp --quiet "$model_name"; then
    echo "Model '$model_name' is not installed. In another terminal, run: ollama pull $model_name" >&2
  fi
fi

echo "Starting the web app and API server..."
npm run dev
