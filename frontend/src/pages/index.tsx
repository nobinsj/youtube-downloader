import { useState, useEffect } from "react";
import "./index.scss";
import type { CompletedItem, QueueItem, VideoFormat } from "../types/video";
import { VideoForm } from "./Home/VideoForm";
import { QueueTable } from "./Home/QueueTable";
import { QueueList } from "./Home/QueueList";
import { Button } from "../components/Button";
import { CompletedList } from "./Home/CompletedList";
import {
  convertAll,
  createProgressEventSource,
  addToQueue,
  getQueue,
  downloadAll,
  type QueueVideo,
  type AvailableFormat,
} from "../services/api";

export const Home: React.FC = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [completed, setCompleted] = useState<CompletedItem[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);

  // Sync state with backend on component mount (handles page reloads gracefully)
  useEffect(() => {
    const syncWorkspaceQueue = async () => {
      try {
        const backendQueue = await getQueue();
        if (Array.isArray(backendQueue)) {
          const pendingItems = backendQueue.filter(item => item.status !== "completed");
          const completedItems = backendQueue.filter(item => item.status === "completed");

          setQueue(pendingItems.map(
            (item: QueueVideo) => ({
              id: item.id,
              url: item.url,
              title: item.title,
              format: item.format as VideoFormat,
              status: item.status,
              progress: item.progress,
              size: item.size || "Calculating...",
            }),
          ));

          setCompleted(completedItems.map(
            (item: QueueVideo) => ({
              id: item.id,
              title: item.title,
              format: item.format as VideoFormat,
              size: item.size || "Unknown Size",
              filename: item.filename || "",
            })
          ));
        }
      } catch (err) {
        console.error(
          "Failed to sync backend workspace queue state profile:",
          err,
        );
      }
    };
    syncWorkspaceQueue();
  }, []);

  const handleAddToQueue = async (url: string, format: VideoFormat) => {
    try {
      // 1. Post directly to FastAPI backend to stage the link item securely
      const stagedItem = await addToQueue({
        url,
        format: format as AvailableFormat,
      });

      // 2. Map server configurations to update local state dynamically
      const newItem: QueueItem = {
        id: stagedItem.id, // Matches backend internal unique tracking ID
        url: stagedItem.url,
        title: stagedItem.title,
        format: stagedItem.format as VideoFormat,
        status: stagedItem.status,
        progress: stagedItem.progress,
        size: stagedItem.size || "Calculating...",
      };

      setQueue((prev) => [...prev, newItem]);
    } catch (error) {
      console.error("Error adding target to server pipeline registry:", error);
      alert(
        "Could not add video to queue. Ensure the link is functional and valid.",
      );
    }
  };

  const handleRemoveFromQueue = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleConvertAll = async () => {
    if (queue.length === 0) return;
    setIsProcessingAll(true);

    try {
      // 1. Fire non-blocking download job workers on the server
      await convertAll();

      // 2. Establish continuous SSE connection pipeline lane
      const eventSource = createProgressEventSource();

      // 3. Process stream transmissions smoothly via native onmessage handler
      eventSource.onmessage = (event) => {
        const updatedBackendQueue: QueueVideo[] = JSON.parse(event.data);

        if (!updatedBackendQueue || updatedBackendQueue.length === 0) return;

        // Verify if any conversion processes are actively tracking progress loops
        const stillProcessing = updatedBackendQueue.some(
          (item) => item.status === "pending" || item.status === "processing",
        );

        // Push real-time download tracking metrics onto active tables live
        if (stillProcessing) {
          const mappedItems: QueueItem[] = updatedBackendQueue.map((item) => ({
            id: item.id,
            url: item.url,
            title: item.title,
            format: item.format as VideoFormat,
            status: item.status,
            progress: item.progress,
            size: item.size || "Calculating...",
          }));
          setQueue(mappedItems);
        }
        // Batch run complete! Safely disconnect the SSE stream
        else {
          eventSource.close();

          const completedItems = updatedBackendQueue.filter(
            (item) => item.status === "completed",
          );

          // Transfer successfully formatted items over to completed list views
          const newOutputs: CompletedItem[] = completedItems.map((item) => ({
            id: item.id,
            title: item.title,
            format: item.format as VideoFormat,
            size: item.size || "Unknown Size",
            filename: item.filename || "",
          }));

          setCompleted(newOutputs); // Replace instead of append to prevent duplicates
          setQueue([]); // Wipe transient pipeline row tracks
          setIsProcessingAll(false);
        }
      };

      eventSource.onerror = (err) => {
        console.error(
          "SSE live synchronization stream closed or disconnected.",
          err,
        );
        eventSource.close();
        setIsProcessingAll(false);
      };
    } catch (error) {
      console.error(
        "Failed executing batch processing initializations:",
        error,
      );
      setIsProcessingAll(false);
    }
  };

  const handleDownloadAllZipped = async () => {
    try {
      // Trigger binary filesystem blob processing to deliver zip transfers
      await downloadAll();
    } catch (error) {
      console.error("Failed downloading zipped archive bundle archive:", error);
    }
  };

  return (
    <div className="home-layout">
      <header className="home-header">
        <div className="home-header__brand">
          <div className="home-header__logo">
            <span>↓</span>
          </div>
          <div>
            <h1 className="home-header__title">FetchFlow</h1>
            <p className="home-header__subtitle">
              High-fidelity automation engine for external pipeline video
              conversions.
            </p>
          </div>
        </div>
      </header>

      <main className="home-main">
        <section className="home-main__hero">
          <VideoForm onAddToQueue={handleAddToQueue} />
        </section>

        {queue.length > 0 && (
          <section className="home-main__queue-section">
            <div className="queue-section-header">
              <h3 className="queue-section-header__title">
                Conversion Pipeline Queue
              </h3>
              <p className="queue-section-header__count">
                {queue.length} items staged
              </p>
            </div>

            <QueueTable items={queue} onRemove={handleRemoveFromQueue} />
            <QueueList items={queue} onRemove={handleRemoveFromQueue} />

            <div className="home-main__convert-actions">
              <Button
                variant="primary"
                onClick={handleConvertAll}
                isLoading={isProcessingAll}
                disabled={queue.length === 0}
                className="convert-trigger-button"
              >
                Execute Pipeline & Convert All
              </Button>
            </div>
          </section>
        )}

        <CompletedList
          items={completed}
          onDownloadAll={handleDownloadAllZipped}
        />
      </main>
    </div>
  );
};
