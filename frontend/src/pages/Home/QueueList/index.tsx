import React from "react";
import { formatLabels } from "../../../services/api";
import { ProgressBar } from "../../../components/ProgressBar";
import { Button } from "../../../components/Button";
import "./index.scss";
import type { QueueItem } from "../../../types/video";

interface QueueListProps {
  items: QueueItem[];
  onRemove: (id: string) => void;
}

export const QueueList: React.FC<QueueListProps> = ({ items, onRemove }) => {
  if (items.length === 0) return null;

  return (
    <div className="queue-mobile-list">
      {items.map((item) => (
        <div className="queue-card" key={item.id}>
          <div className="queue-card__header">
            <h4 className="queue-card__title">{item.title}</h4>
            <span className={`status-badge status-badge--${item.status}`}>
              {item.status}
            </span>
          </div>

          <div className="queue-card__meta">
            <span className="queue-card__format">
              {formatLabels[item.format]}
            </span>
          </div>

          {(item.status === "processing" || item.status === "completed") && (
            <div className="queue-card__progress">
              <ProgressBar progress={item.progress} />
            </div>
          )}

          <div className="queue-card__actions">
            <Button
              variant="danger"
              fullWidth
              onClick={() => onRemove(item.id)}
              disabled={item.status === "processing"}
            >
              Remove Asset
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
