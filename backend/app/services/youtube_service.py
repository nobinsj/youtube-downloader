import yt_dlp
import imageio_ffmpeg


class YoutubeService:

    @staticmethod
    def get_video_info(url: str):
        """
        Fetch title, duration, thumbnail and video id.
        """

        ydl_opts = {"quiet": True, "no_warnings": True, "extract_flat": False}

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)

            return {
                "id": info.get("id", ""),
                "title": info.get("title", ""),
                "duration": info.get("duration", 0),
                "thumbnail": info.get("thumbnail", ""),
            }

    @staticmethod
    def download_mp3(url: str, output_path: str, progress_callback=None):
        """
        Download best audio and convert to mp3.
        """

        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": output_path,
            "ffmpeg_location": imageio_ffmpeg.get_ffmpeg_exe(),
            "postprocessors": [
                {
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "mp3",
                    "preferredquality": "320",
                }
            ],
        }

        if progress_callback:
            ydl_opts["progress_hooks"] = [progress_callback]

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

    @staticmethod
    def download_mp4(url: str, output_path: str, progress_callback=None):
        """
        Download best MP4.
        """

        ydl_opts = {
            "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
            "outtmpl": output_path,
            "ffmpeg_location": imageio_ffmpeg.get_ffmpeg_exe(),
            "merge_output_format": "mp4",
        }

        if progress_callback:
            ydl_opts["progress_hooks"] = [progress_callback]

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
