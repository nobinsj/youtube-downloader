import React from "react";
import "./index.scss";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: DropdownOption[];
  error?: string;
  fullWidth?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  error,
  fullWidth = true,
  className = "",
  id,
  ...props
}) => {
  const dropdownId = id || React.useId();

  return (
    <div
      className={`dropdown-field ${fullWidth ? "dropdown-field--full" : ""} ${error ? "dropdown-field--error" : ""} ${className}`}
    >
      {label && (
        <label htmlFor={dropdownId} className="dropdown-field__label">
          {label}
        </label>
      )}
      <div className="dropdown-field__wrapper">
        <select id={dropdownId} className="dropdown-field__select" {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="dropdown-field__arrow" aria-hidden="true">
          ▼
        </span>
      </div>
      {error && <p className="dropdown-field__error-msg">{error}</p>}
    </div>
  );
};
