// Input.jsx — Precision text input.
//             Syne uppercase label, amber focus glow ring,
//             error state with red left-accent bar + warning icon,
//             icon and rightElement slots.

import { useState } from "react";

function WarnIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
      aria-hidden="true"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export default function Input({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  error,
  disabled = false,
  icon,
  rightElement,
  id,
  name,
  className = "",
  ...rest
}) {
  const [focused, setFocused] = useState(false);

  const inputStyle = () => {
    const base = {
      background: "var(--input-bg)",
      color: "var(--text-primary)",
      width: "100%",
      height: "42px",
      borderRadius: "10px",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-base)",
      boxSizing: "border-box",
      outline: "none",
      paddingLeft: icon ? "40px" : "14px",
      paddingRight: rightElement ? "40px" : "14px",
      transition: "box-shadow 180ms ease, border-color 180ms ease, background-color 180ms ease",
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? "not-allowed" : "text",
    };

    if (error) {
      return {
        ...base,
        border: "1px solid var(--accent-red)",
        borderLeft: "3px solid var(--accent-red)",
        boxShadow:
          "inset 0 1px 3px rgba(0,0,0,0.2), 0 0 0 3px var(--accent-red-bg)",
      };
    }

    if (focused) {
      return {
        ...base,
        background: "color-mix(in srgb, var(--input-bg) 85%, white)",
        border: "1px solid var(--input-focus-border)",
        boxShadow:
          "inset 0 1px 3px rgba(0,0,0,0.2), 0 0 0 3px var(--accent-glow)",
      };
    }

    return {
      ...base,
      border: "1px solid var(--input-border)",
      boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)",
    };
  };

  return (
    <div
      className={className}
      style={{ display: "flex", flexDirection: "column", gap: "6px" }}
    >
      {label && (
        <label
          htmlFor={id}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--text-muted)",
            display: "block",
          }}
        >
          {label}
        </label>
      )}

      <div
        style={{ position: "relative", display: "flex", alignItems: "center" }}
      >
        {icon && (
          <span
            style={{
              position: "absolute",
              left: "12px",
              display: "flex",
              alignItems: "center",
              color: "var(--text-muted)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            {icon}
          </span>
        )}

        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...inputStyle(),
            /* Placeholder color via inline style doesn't work cross-browser;
               handled via Tailwind placeholder utility below */
          }}
          className="placeholder:text-(--text-muted) placeholder:opacity-60"
          {...rest}
        />

        {rightElement && (
          <span
            style={{
              position: "absolute",
              right: "12px",
              display: "flex",
              alignItems: "center",
              color: "var(--text-muted)",
              zIndex: 1,
            }}
          >
            {rightElement}
          </span>
        )}
      </div>

      {error && (
        <span
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontFamily: "var(--font-body)",
            fontSize: "0.75rem",
            color: "var(--accent-red)",
          }}
        >
          <WarnIcon />
          {error}
        </span>
      )}
    </div>
  );
}
