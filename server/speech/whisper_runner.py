#!/usr/bin/env python3
"""
whisper_runner.py
Lightweight Whisper ASR CLI runner using HuggingFace Transformers.
Accepts an audio file path (WAV, MP3, WebM, OGG) and outputs JSON: {"text": "..."}.
"""

import sys
import json
import os
from pathlib import Path

def transcribe_audio(file_path: str):
    if not os.path.isfile(file_path):
        return {"error": f"Audio file not found: {file_path}", "text": ""}

    try:
        import torch
        from transformers import pipeline

        device = "cuda:0" if torch.cuda.is_available() else "cpu"
        model_name = os.getenv("WHISPER_MODEL", "openai/whisper-tiny")

        pipe = pipeline(
            "automatic-speech-recognition",
            model=model_name,
            device=device,
            chunk_length_s=30,
        )

        result = pipe(file_path)
        text = result.get("text", "").strip() if isinstance(result, dict) else str(result).strip()
        return {"text": text}
    except Exception as e:
        return {"error": str(e), "text": ""}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing audio file argument", "text": ""}))
        sys.exit(1)

    audio_file = sys.argv[1]
    output = transcribe_audio(audio_file)
    print(json.dumps(output))
