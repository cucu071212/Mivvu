import type { CSSProperties } from "react";

export type MivvuWordmarkProps = {
  /** intro: large centered splash; header: airport screen; headerCompact: ICN browse toolbar */
  variant: "intro" | "header" | "headerCompact";
  className?: string;
};

/**
 * Shared Mivvu wordmark — typography recovered from Stitch screen_1 code.html.
 * No separate symbol; letter-spaced inner “v” matches export markup.
 */
export function MivvuWordmark({ variant, className = "" }: MivvuWordmarkProps) {
  const innerVStyle: CSSProperties = {
    letterSpacing: "0.08em",
    display: "inline-block",
  };

  if (variant === "header" || variant === "headerCompact") {
    return (
      <span
        className={`mivvu-wordmark ${
          variant === "headerCompact" ? "mivvu-wordmark-header-compact" : "mivvu-wordmark-header"
        } ${className}`.trim()}
        aria-label="Mivvu"
      >
        Mivvu
      </span>
    );
  }

  return (
    <h1
      className={`mivvu-wordmark mivvu-wordmark-intro ${className}`.trim()}
      style={{ letterSpacing: "0.02em" }}
    >
      Miv<span style={innerVStyle}>v</span>u
    </h1>
  );
}
