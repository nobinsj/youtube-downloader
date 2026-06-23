import React from "react";
import "./index.scss";

interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showLabel = true,
}) => {
  const clampedProgress = Math.min(Math.max(0, progress), 100);

  return (
    <div className="progress-container">
      <div className="progress-container__track">
        <div
          className="progress-container__bar"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showLabel && (
        <span className="progress-container__label">{clampedProgress}%</span>
      )}
    </div>
  );
};
