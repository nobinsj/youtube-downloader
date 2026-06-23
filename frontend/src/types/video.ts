export type VideoFormat = "mp3-320" | "mp4-1080" | "mp4-720" | "webm-2k";

export type VideoStatus = "pending" | "processing" | "completed" | "failed";

export interface QueueItem {
  id: string;
  url: string;
  title: string;
  format: VideoFormat;
  status: VideoStatus;
  progress: number; // 0 to 100
  size?: string;
}

export interface CompletedItem {
  id: string;
  title: string;
  format: VideoFormat;
  size: string;
  filename: string;
}
