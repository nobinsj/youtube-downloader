from typing import Optional, Literal
from pydantic import BaseModel, HttpUrl


class VideoInfoRequest(BaseModel):
    url: str


class VideoInfoResponse(BaseModel):
    id: str
    title: str
    duration: int
    thumbnail: str


class QueueRequest(BaseModel):
    url: str
    format: str


class QueueVideo(BaseModel):
    id: str
    url: str
    title: str
    format: str

    status: Literal[
        "pending",
        "processing",
        "completed",
        "failed"
    ]

    progress: int = 0

    size: Optional[str] = "Calculating..."

    filename: Optional[str] = None