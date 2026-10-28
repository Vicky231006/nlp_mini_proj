/**
 * whisperTranscribe.js
 * Node.js service for lightweight Whisper Speech-to-Text (STT).
 * Interfaces with local Python Transformers Whisper pipeline or an external
 * Whisper API endpoint with automated cleanup and graceful client fallback.
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { projectRoot } from '../config.js';

const VENV_PYTHON = resolve(projectRoot, '.venv-retrieval', 'Scripts', 'python.exe');
const VENV_PYTHON_UNIX = resolve(projectRoot, '.venv-retrieval', 'bin', 'python');
const RUNNER_SCRIPT = resolve(projectRoot, 'server', 'speech', 'whisper_runner.py');

/**
 * Resolves the python executable path.
 */
function getPythonPath() {
  if (process.platform === 'win32' && existsSync(VENV_PYTHON)) {
    return VENV_PYTHON;
  }
  if (existsSync(VENV_PYTHON_UNIX)) {
    return VENV_PYTHON_UNIX;
  }
  return 'python';
}

/**
 * Transcribes audio buffer using the lightweight Whisper Python runner or external Whisper API.
 *
 * @param {Buffer} audioBuffer - Binary audio data (WebM, WAV, OGG, MP3).
 * @param {string} [extension='webm'] - Audio file format extension.
 * @param {Object} [options={}] - Optional configuration overrides.
 * @returns {Promise<{ text: string, engine: string, error?: string }>}
 */
export async function transcribeAudioBuffer(audioBuffer, extension = 'webm', options = {}) {
  const whisperApiUrl = options.whisperApiUrl || process.env.WHISPER_API_URL;

  // 1. If an external Whisper API endpoint is provided, use it
  if (whisperApiUrl) {
    try {
      const response = await fetch(whisperApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': `audio/${extension}`,
          ...(process.env.HF_API_TOKEN ? { Authorization: `Bearer ${process.env.HF_API_TOKEN}` } : {})
        },
        body: audioBuffer,
        signal: AbortSignal.timeout(options.timeoutMs || 25000)
      });

      if (!response.ok) {
        throw new Error(`Whisper API responded with HTTP ${response.status}`);
      }

      const json = await response.json();
      const text = (json.text || json[0]?.generated_text || '').trim();
      return { text, engine: 'whisper-api' };
    } catch (apiError) {
      console.warn('External Whisper API failed, falling back to local runner:', apiError.message);
    }
  }

  // 2. Use local Python Transformers Whisper runner
  const tempDir = join(tmpdir(), 'puzzle_lab_audio');
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }

  const tempFilePath = join(tempDir, `stt_${randomUUID()}.${extension}`);
  try {
    writeFileSync(tempFilePath, audioBuffer);

    const pythonPath = getPythonPath();
    const result = await new Promise((resolvePromise, rejectPromise) => {
      const child = spawn(pythonPath, ['-u', RUNNER_SCRIPT, tempFilePath], {
        windowsHide: true,
        timeout: options.timeoutMs || 30000
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
      child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

      child.on('error', (err) => rejectPromise(err));
      child.on('close', (code) => {
        if (code !== 0) {
          rejectPromise(new Error(`Whisper process exited with code ${code}. Error: ${stderr || stdout}`));
          return;
        }
        try {
          const lines = stdout.trim().split('\n');
          const lastLine = lines[lines.length - 1];
          const parsed = JSON.parse(lastLine);
          resolvePromise(parsed);
        } catch {
          resolvePromise({ text: stdout.trim() });
        }
      });
    });

    return {
      text: (result.text || '').trim(),
      engine: 'whisper-local'
    };
  } catch (error) {
    return {
      text: '',
      engine: 'whisper-local-error',
      error: error instanceof Error ? error.message : String(error)
    };
  } finally {
    try {
      if (existsSync(tempFilePath)) {
        unlinkSync(tempFilePath);
      }
    } catch {
      // Ignore temporary file deletion failure
    }
  }
}
