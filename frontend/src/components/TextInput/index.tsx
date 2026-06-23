import React from "react";
import "./index.scss";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helperText,
  fullWidth = true,
  className = "",
  id,
  ...props
}) => {
  const inputId = id || React.useId();

  return (
    <div
      className={`input-field ${fullWidth ? "input-field--full" : ""} ${error ? "input-field--error" : ""} ${className}`}
    >
      {label && (
        <label htmlFor={inputId} className="input-field__label">
          {label}
        </label>
      )}
      <input id={inputId} className="input-field__input" {...props} />
      {error && <p className="input-field__error-msg">{error}</p>}
      {!error && helperText && (
        <p className="input-field__helper-msg">{helperText}</p>
      )}
    </div>
  );
};
