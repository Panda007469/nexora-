import { useState } from "react";

interface InitialsAvatarProps {
  name: string;
  photo?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function InitialsAvatar({
  name,
  photo,
  size = "md",
  className = "",
}: InitialsAvatarProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Compute initials: first letter of each word (up to 2 letters)
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

  const sizeStyles = {
    sm: "size-8 text-xs font-semibold ring-[2px]",
    md: "size-12 text-sm font-bold ring-[2px]",
    lg: "size-24 sm:size-28 text-2xl font-bold ring-[3px]",
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full p-[2px] bg-brand-gradient shrink-0 ${className}`}
    >
      <div
        className={`relative flex items-center justify-center rounded-full bg-navy text-white font-heading overflow-hidden ${sizeStyles}`}
      >
        <span>{initials}</span>
        {photo && !imageError && (
          <img
            src={photo}
            alt={name}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-200 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </div>
    </div>
  );
}
