interface LogoProps {
  variant?: "full" | "mark";
  className?: string;
}

export function Logo({ variant = "full", className }: LogoProps) {
  const isFull = variant === "full";
  const src = isFull ? "/images/nexora-logo-full.png" : "/images/nexora-logo-mark.png";
  const width = isFull ? 364 : 270;
  const height = isFull ? 377 : 250;

  return (
    <img
      src={src}
      alt="Nexora Technologies"
      width={width}
      height={height}
      className={className}
    />
  );
}

