import React, { useState } from "react";
import { formatLabels, downloadFile } from "../../../services/api";
import { Button } from "../../../components/Button";
import "./index.scss";
import type { CompletedItem } from "../../../types/video";

interface CompletedListProps {
  items: CompletedItem[];
  isLoading: boolean;
  onDownloadAll: () => void;
}

export const CompletedList: React.FC<CompletedListProps> = ({
  items,
  isLoading,
  onDownloadAll,
}) => {
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  const handleDownload = async (filename: string) => {
    try {
      setDownloadingFile(filename);
      await downloadFile(filename);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloadingFile(null);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="completed-container">
      <div className="completed-container__header">
        <div>
          <h3 className="completed-container__title">Generated Outputs</h3>
          <p className="completed-container__subtitle">
            Your requested multimedia production files are prepared below.
          </p>
        </div>
        {items.length > 1 && (
          <Button
            variant="primary"
            onClick={onDownloadAll}
            isLoading={isLoading}
            className="completed-container__download-all"
          >
            Download All Packages (.zip)
          </Button>
        )}
      </div>

      <div className="completed-container__list">
        {items.map((item) => (
          <div className="completed-card" key={item.id}>
            <div className="completed-card__info">
              <div className="completed-card__title-row">
                <span className="completed-card__file-name">{item.title}</span>
                <span className="completed-card__badge">
                  {formatLabels[item.format]}
                </span>
              </div>
              <div className="completed-card__details">
                <span className="completed-card__size">{item.size}</span>
                <span className="completed-card__divider">•</span>
                <span className="completed-card__status-text">
                  Ready for Transfer
                </span>
              </div>
            </div>
            <div className="completed-card__action">
              <button
                onClick={() => handleDownload(item.filename)}
                disabled={downloadingFile !== null}
                className="completed-card__link-btn"
                style={{
                  border: "none",
                  cursor: downloadingFile ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  opacity: downloadingFile ? 0.7 : 1,
                }}
              >
                {downloadingFile === item.filename
                  ? "Downloading..."
                  : "Download File"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="completed-container__mobile-action">
          <Button
            variant="primary"
            fullWidth
            onClick={onDownloadAll}
            isLoading={isLoading}
          >
            Download All Packages (.zip)
          </Button>
        </div>
      )}
    </div>
  );
};
