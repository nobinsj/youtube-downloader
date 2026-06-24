import traceback

from pathlib import Path
from urllib.parse import unquote
from fastapi.responses import FileResponse
from urllib.parse import unquote, quote

from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from fastapi.responses import FileResponse

from sse_starlette.sse import EventSourceResponse

from app.models.video import VideoInfoRequest, VideoInfoResponse, QueueRequest

from app.services.youtube_service import YoutubeService
from app.services.queue_service import QueueService

router = APIRouter(tags=["YouTube Downloader"])

BASE_DIR = Path(__file__).parent.parent
DOWNLOAD_DIR = BASE_DIR / "downloads"


# =====================================================
# HEALTH CHECK
# =====================================================


@router.get("/")
def health():
    return {"status": "running", "service": "youtube-downloader-api"}


# =====================================================
# VIDEO INFO
# POST /video-info
# =====================================================


@router.post("/video-info", response_model=VideoInfoResponse)
def get_video_info(payload: VideoInfoRequest):
    try:

        info = YoutubeService.get_video_info(payload.url)

        return VideoInfoResponse(
            id=info["id"],
            title=info["title"],
            duration=info["duration"],
            thumbnail=info["thumbnail"],
        )

    except Exception as e:

        raise HTTPException(
            status_code=400, detail=f"Unable to fetch video information. {str(e)}"
        )


# =====================================================
# ADD TO QUEUE
# POST /queue
# =====================================================


@router.post("/queue")
def add_to_queue(payload: QueueRequest):
    try:

        video_info = YoutubeService.get_video_info(payload.url)

        queue_item = QueueService.add_to_queue(
            url=payload.url, format_type=payload.format, title=video_info["title"]
        )

        return queue_item

    except Exception as e:

        raise HTTPException(
            status_code=400, detail=f"Failed to add video to queue. {str(e)}"
        )


# =====================================================
# GET QUEUE
# GET /queue
# =====================================================


@router.get("/queue")
def get_queue():

    return QueueService.get_queue()


# =====================================================
# CONVERT ALL
# POST /convert-all
# =====================================================


async def run_conversion():
    await QueueService.start_conversion()


@router.post("/convert-all")
async def convert_all(background_tasks: BackgroundTasks):
    try:

        queue = QueueService.get_queue()

        if len(queue) == 0:

            raise HTTPException(status_code=400, detail="Queue is empty.")

        background_tasks.add_task(run_conversion)

        return {"processed_count": len(queue)}

    except Exception as e:

        raise HTTPException(status_code=500, detail=str(e))


# =====================================================
# SSE PROGRESS
# GET /progress
# =====================================================


@router.get("/progress")
async def progress_stream(request: Request):

    return EventSourceResponse(QueueService.stream_progress(request))


# =====================================================
# DOWNLOAD SINGLE FILE
# GET /download/{filename}
# =====================================================


@router.get("/download/{filename:path}")
async def download_file(filename: str):
    filename = unquote(filename)

    file_path = DOWNLOAD_DIR / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=file_path, filename=filename, media_type="application/octet-stream"
    )


# =====================================================
# DOWNLOAD ALL ZIP
# GET /download-all
# =====================================================


@router.get("/download-all")
def download_all():

    zip_path = QueueService.create_zip()

    if not Path(zip_path).exists():

        raise HTTPException(status_code=404, detail="ZIP archive not found.")

    return FileResponse(
        path=zip_path, filename="downloads.zip", media_type="application/zip"
    )


@router.post("/convert-download")
async def convert_and_download(payload: QueueRequest):

    output_file = await YoutubeService.download_video(payload.url, payload.format)

    file_path = Path(output_file)

    return {"success": True, "filename": file_path.name}


@router.delete("/queue/{item_id}")
def remove_queue_item(item_id: str):
    removed = QueueService.remove_from_queue(item_id)

    if not removed:
        raise HTTPException(status_code=404, detail="Queue item not found.")

    return {"success": True, "message": "Item removed from queue."}
