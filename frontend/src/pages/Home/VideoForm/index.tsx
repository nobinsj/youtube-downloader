import React, { useState } from "react";
import { TextInput } from "../../../components/TextInput";
import { Dropdown } from "../../../components/Dropdown";
import { Button } from "../../../components/Button";
import "./index.scss";
import type { VideoFormat } from "../../../types/video";

interface VideoFormProps {
  onAddToQueue: (url: string, format: VideoFormat) => Promise<void>;
}

export const VideoForm: React.FC<VideoFormProps> = ({ onAddToQueue }) => {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<VideoFormat>("mp4-1080");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatOptions = [
    { value: "mp4-1080", label: "Video - MP4 (1080p)" },
    { value: "mp4-720", label: "Video - MP4 (720p)" },
    { value: "webm-2k", label: "Video - WebM (1440p)" },
    { value: "mp3-320", label: "Audio - MP3 (320kbps)" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Please provide a valid YouTube link.");
      return;
    }
    if (!url.includes("youtube.com/") && !url.includes("youtu.be/")) {
      setError("Must be a proper YouTube URL format.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddToQueue(url, format);
      setUrl("");
    } catch (err) {
      setError("Could not process video metadata.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="video-form" onSubmit={handleSubmit}>
      <div className="video-form__grid">
        <TextInput
          label="YouTube Video Link"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          error={error}
        />
        <Dropdown
          label="Output Media Format"
          options={formatOptions}
          value={format}
          onChange={(e) => setFormat(e.target.value as VideoFormat)}
        />
      </div>
      <div className="video-form__actions">
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          Add to Workspace Queue
        </Button>
      </div>
    </form>
  );
};
