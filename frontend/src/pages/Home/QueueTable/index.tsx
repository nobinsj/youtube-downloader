import React from "react";
import { formatLabels } from "../../../services/api";
import { ProgressBar } from "../../../components/ProgressBar";
import { Button } from "../../../components/Button";
import "./index.scss";
import type { QueueItem } from "../../../types/video";

interface QueueTableProps {
  items: QueueItem[];
  onRemove: (id: string) => void;
}

export const QueueTable: React.FC<QueueTableProps> = ({ items, onRemove }) => {
  if (items.length === 0) return null;

  return (
    <div className="queue-table-wrapper">
      <table className="queue-table">
        <thead>
          <tr>
            <th>Video Asset Title</th>
            <th>Target Format</th>
            <th>Status</th>
            <th>Task Execution Progress</th>
            <th className="queue-table__align-right">Management</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="queue-table__title-cell" title={item.url}>
                {item.title}
              </td>
              <td>
                <span className="queue-table__format-tag">
                  {formatLabels[item.format]}
                </span>
              </td>
              <td>
                <span className={`status-badge status-badge--${item.status}`}>
                  {item.status}
                </span>
              </td>
              <td className="queue-table__progress-cell">
                {item.status === "processing" || item.status === "completed" ? (
                  <ProgressBar progress={item.progress} />
                ) : (
                  <span className="queue-table__muted-text">—</span>
                )}
              </td>
              <td className="queue-table__align-right">
                <Button
                  variant="danger"
                  onClick={() => onRemove(item.id)}
                  disabled={item.status === "processing"}
                >
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
