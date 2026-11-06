"""Encode the 168 rendered Blender frames into the website film.

Run with Python after rendering the frames. Install imageio-ffmpeg or provide
TSI_FFMPEG=/path/to/ffmpeg when ffmpeg is not on PATH.
"""

import os
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FRAMES = ROOT / "blender/renders/cinematic-frames"
OUTPUT = ROOT / "client/public/assets/tsi-human-cinematic.mp4"

files = sorted(FRAMES.glob("frame-*.png"))
if len(files) != 168:
    raise RuntimeError(f"Expected 168 rendered frames, found {len(files)}")

ffmpeg = os.environ.get("TSI_FFMPEG") or shutil.which("ffmpeg")
if not ffmpeg:
    try:
        import imageio_ffmpeg

        ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError as exc:
        raise RuntimeError(
            "FFmpeg is required. Install imageio-ffmpeg or set TSI_FFMPEG."
        ) from exc

subprocess.run(
    [
        ffmpeg,
        "-y",
        "-framerate", "12",
        "-i", str(FRAMES / "frame-%04d.png"),
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-crf", "18",
        "-movflags", "+faststart",
        str(OUTPUT),
    ],
    check=True,
)
print("ENCODED", OUTPUT)
