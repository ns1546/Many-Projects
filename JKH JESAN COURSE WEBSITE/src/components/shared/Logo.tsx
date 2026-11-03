import React from "react";

interface LogoProps {
  variant?: "auto" | "dark" | "white";
  size?: "sm" | "md" | "lg";
  markOnly?: boolean;
  className?: string;
}

export function Logo({
  variant = "dark",
  size = "md",
  markOnly = false,
  className = "",
}: LogoProps) {
  // Dimensions calibrated to preserve perfect 832x609 aspect ratio of the original logo
  const dimensions = {
    sm: { width: 44, height: 32, mark: 28 },
    md: { width: 55, height: 40, mark: 34 },
    lg: { width: 78, height: 56, mark: 48 },
  };

  const dim = dimensions[size] || dimensions.md;

  if (markOnly) {
    if (variant === "white") {
      return (
        <img
          src="/logo-mark-white.png"
          alt="EVORISE MEDIA"
          width={dim.mark}
          height={dim.mark}
          className={"shrink-0 object-contain " + className}
        />
      );
    }
    return (
      <img
        src="/logo-mark-dark.png"
        alt="EVORISE MEDIA"
        width={dim.mark}
        height={dim.mark}
        className={"shrink-0 object-contain " + className}
      />
    );
  }

  // When variant="white" (for dark surfaces like Admin sidebar or dark hero):
  if (variant === "white") {
    return (
      <div className={"flex items-center shrink-0 " + className}>
        <img
          src="/logo-tight-white.png"
          alt="EVORISE MEDIA"
          width={dim.width}
          height={dim.height}
          className="object-contain shrink-0"
          style={{ height: dim.height, width: "auto" }}
        />
      </div>
    );
  }

  // Default: Always render the crisp high-contrast dark logo on 100% transparent background
  // Perfectly visible on the Warm Studio cream palette regardless of device dark mode settings
  return (
    <div className={"flex items-center shrink-0 " + className}>
      <img
        src="/logo-tight-dark.png"
        alt="EVORISE MEDIA"
        width={dim.width}
        height={dim.height}
        className="object-contain shrink-0"
        style={{ height: dim.height, width: "auto" }}
      />
    </div>
  );
}
