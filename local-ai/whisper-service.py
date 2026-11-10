"""Private localhost Whisper adapter for Invincible Voiceover Analysis.

Run with the E:\\AI\\Whisper Python environment. The service accepts only an
audioPath inside INVINCIBLE_AGENT_WORKSPACE and never exposes file contents.
"""
import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from faster_whisper import WhisperModel

HOST = "127.0.0.1"
PORT = int(os.environ.get("INVINCIBLE_WHISPER_PORT", "8790"))
WORKSPACE = Path(os.environ.get("INVINCIBLE_AGENT_WORKSPACE", r"E:\Invincible\AgentWorkspace")).resolve()
MODEL = os.environ.get("INVINCIBLE_WHISPER_MODEL", "small")
MODEL_DIR = os.environ.get("INVINCIBLE_WHISPER_MODEL_DIR", r"E:\AI\Whisper\models")
DEVICE = os.environ.get("INVINCIBLE_WHISPER_DEVICE", "cpu")
COMPUTE = os.environ.get("INVINCIBLE_WHISPER_COMPUTE", "int8")

model = None

def load_model():
    global model
    if model is not None:
        return model
    try:
        model = WhisperModel(MODEL, device=DEVICE, compute_type=COMPUTE, download_root=MODEL_DIR)
    except Exception:
        if DEVICE == "cuda":
            model = WhisperModel(MODEL, device="cpu", compute_type="int8", download_root=MODEL_DIR)
        else:
            raise
    return model

def allowed_audio(value):
    candidate = Path(value).resolve()
    try:
        candidate.relative_to(WORKSPACE)
    except ValueError:
        raise ValueError("Audio must be inside the restricted agent workspace.")
    if candidate.suffix.lower() not in {".mp3", ".wav"}:
        raise ValueError("Only MP3 and WAV files are supported.")
    if not candidate.is_file():
        raise ValueError("Audio file does not exist.")
    return candidate

def transcribe(audio_path):
    segments, info = load_model().transcribe(str(audio_path), beam_size=5, language=None, word_timestamps=True, vad_filter=True)
    result = []
    for number, segment in enumerate(segments, 1):
        words = [{"word": word.word.strip(), "start": float(word.start), "end": float(word.end)} for word in (segment.words or []) if word.word.strip()]
        result.append({"id": f"segment-{number}", "start": float(segment.start), "end": float(segment.end), "text": segment.text.strip(), "words": words})
    return {"language": info.language, "duration": float(info.duration), "text": " ".join(item["text"] for item in result), "segments": result}

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/transcribe":
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("content-length", "0"))
            body = json.loads(self.rfile.read(length) or b"{}")
            result = transcribe(allowed_audio(body.get("audioPath", "")))
            payload = json.dumps(result).encode()
            self.send_response(200)
            self.send_header("content-type", "application/json")
            self.send_header("content-length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        except Exception as error:
            payload = json.dumps({"error": str(error)}).encode()
            self.send_response(400)
            self.send_header("content-type", "application/json")
            self.send_header("content-length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)

    def log_message(self, *_):
        return

if __name__ == "__main__":
    print(f"Invincible Whisper: http://{HOST}:{PORT} (workspace {WORKSPACE})", flush=True)
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
