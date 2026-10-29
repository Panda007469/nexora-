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

  // If photo is provided and has not failed to load, render the photo inside the gradient ring
  if (photo && !imageError) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-full p-[2px] bg-brand-gradient ${className}`}
      >
        <img
          src={photo}
          alt={name}
          onError={() => setImageError(true)}
          className={`rounded-full object-cover bg-navy ${sizeStyles.split(" ")[0]} ${sizeStyles.split(" ")[1]}`}
        />
      </div>
    );
  }

  // Circular initials avatar with navy background, white initials, bg-brand-gradient ring
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full p-[2px] bg-brand-gradient shrink-0 ${className}`}
    >
      <div
        className={`flex items-center justify-center rounded-full bg-navy text-white font-heading ${sizeStyles}`}
        aria-hidden="true"
      >
        <span>{initials}</span>
      </div>
    </div>
  );
}

