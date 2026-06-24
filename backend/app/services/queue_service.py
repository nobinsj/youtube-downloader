import asyncio
import os
import uuid
import zipfile
from pathlib import Path
from typing import List

from app.models.video import QueueVideo
from app.services.youtube_service import YoutubeService

BASE_DIR = Path(__file__).parent.parent
DOWNLOAD_DIR = BASE_DIR / "downloads"
DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)


class QueueService:
    """
    In-memory queue manager.
    """

    _queue: List[QueueVideo] = []
    _lock = asyncio.Lock()

    @classmethod
    def add_to_queue(
        cls,
        url: str,
        format_type: str,
        title: str,
    ) -> QueueVideo:

        queue_item = QueueVideo(
            id=str(uuid.uuid4()),
            url=url,
            title=title,
            format=format_type,
            status="pending",
            progress=0,
            size="Calculating...",
            filename=None,
        )

        cls._queue.append(queue_item)

        return queue_item

    @classmethod
    def get_queue(cls) -> List[QueueVideo]:
        return cls._queue

    @classmethod
    def get_item(cls, item_id: str):
        for item in cls._queue:
            if item.id == item_id:
                return item
        return None

    @classmethod
    async def start_conversion(cls):
        """
        Start conversion for all pending items.
        Runs sequentially.
        """
        async with cls._lock:
            for item in cls._queue:

                if item.status != "pending":
                    continue

                try:
                    item.status = "processing"

                    filename = await asyncio.to_thread(cls._download_video, item)

                    item.filename = filename
                    item.progress = 100
                    item.status = "completed"

                    filepath = DOWNLOAD_DIR / filename

                    if filepath.exists():
                        size_bytes = filepath.stat().st_size
                        item.size = cls._human_size(size_bytes)

                except Exception as e:
                    print("Conversion Error:", e)
                    item.status = "failed"

    @classmethod
    def _download_video(cls, item: QueueVideo) -> str:
        safe_title = "".join(
            c for c in item.title if c.isalnum() or c in (" ", "-", "_")
        ).strip()

        download_stage = {"count": 0, "last_progress": 0}

        def progress_hook(d):
            if d["status"] == "downloading":
                percent_str = d.get("_percent_str", "0%").strip()
                import re

                percent_str = re.sub(r"\x1b\[[0-9;]*m", "", percent_str)
                percent_str = percent_str.replace("%", "")
                try:
                    current_percent = float(percent_str)

                    if current_percent < download_stage["last_progress"] - 40:
                        download_stage["count"] += 1

                    download_stage["last_progress"] = current_percent

                    if item.format == "mp3-320":
                        new_prog = int(current_percent)
                    else:
                        if download_stage["count"] == 0:
                            new_prog = int(current_percent * 0.85)
                        else:
                            new_prog = int(85 + (current_percent * 0.15))

                    # Ensure progress never goes backward visually
                    if new_prog > item.progress:
                        item.progress = new_prog
                except ValueError:
                    pass

        if item.format == "mp3-320":
            filename = f"{safe_title}.mp3"
            output_path = str(DOWNLOAD_DIR / f"{safe_title}.%(ext)s")
            YoutubeService.download_mp3(
                item.url, output_path, progress_callback=progress_hook
            )
            return filename
        else:
            filename = f"{safe_title}.mp4"
            output_path = str(DOWNLOAD_DIR / f"{safe_title}.%(ext)s")
            YoutubeService.download_mp4(
                item.url, output_path, progress_callback=progress_hook
            )
            return filename

    @classmethod
    async def stream_progress(cls, request):
        """
        SSE Generator.
        """
        import json

        while True:
            if await request.is_disconnected():
                break

            payload = [item.model_dump() for item in cls._queue]
            yield {"data": json.dumps(payload)}
            await asyncio.sleep(1)

    @classmethod
    def clear_completed(cls):
        cls._queue = [item for item in cls._queue if item.status != "completed"]

    @classmethod
    def create_zip(cls) -> str:

        zip_name = "downloads.zip"

        zip_path = DOWNLOAD_DIR / zip_name

        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:

            for item in cls._queue:

                if item.status == "completed" and item.filename:

                    file_path = DOWNLOAD_DIR / item.filename

                    if file_path.exists():

                        zipf.write(file_path, arcname=item.filename)

        return str(zip_path)

    @staticmethod
    def _human_size(size_bytes):

        for unit in ["B", "KB", "MB", "GB"]:

            if size_bytes < 1024:
                return f"{size_bytes:.2f} {unit}"

            size_bytes /= 1024

        return f"{size_bytes:.2f} TB"

    @classmethod
    def remove_from_queue(cls, item_id: str) -> bool:
        initial_length = len(cls._queue)

        cls._queue = [item for item in cls._queue if item.id != item_id]

        return len(cls._queue) < initial_length
