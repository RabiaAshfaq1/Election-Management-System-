import Image from "next/image";

import { cn } from "@/lib/utils";

interface CandidateAvatarProps {
  name: string;
  photoUrl: string | null;
  size?: number;
  className?: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function CandidateAvatar({
  name,
  photoUrl,
  size = 80,
  className,
}: CandidateAvatarProps) {
  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        width={size}
        height={size}
        sizes={`${size}px`}
        className={cn("rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-teal/15 font-heading text-lg font-bold text-teal",
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}
