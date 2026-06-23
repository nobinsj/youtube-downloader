import React from "react";
import "./index.scss";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  isLoading = false,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`btn btn--${variant} ${fullWidth ? "btn--full" : ""} ${isLoading ? "btn--loading" : ""} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? <span className="btn__spinner" aria-hidden="true" /> : null}
      <span className="btn__text">{children}</span>
    </button>
  );
};
