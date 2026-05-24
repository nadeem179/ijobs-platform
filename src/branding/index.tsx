"use client";

import Image from "next/image";
import { BRAND } from "@/lib/branding";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  priority?: boolean;
};

type LogoIconProps = LogoProps & {
  size?: number;
};

export function LogoIcon({
  size = 32,
  className,
  priority = false,
}: LogoIconProps) {
  return (
    <span
      className={cn("relative block shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={BRAND.logoIconPath}
        alt={BRAND.appName}
        fill
        sizes={`${size}px`}
        className="object-contain dark:invert"
        priority={priority}
      />
    </span>
  );
}

export function LogoWordmark({
  className,
  priority = false,
}: LogoProps) {
  return (
    <Image
      src={BRAND.logoBlackPath}
      alt={BRAND.appName}
      width={120}
      height={48}
      sizes="(max-width: 640px) 96px, 120px"
      className={cn("h-auto w-24 object-contain dark:invert sm:w-[120px]", className)}
      priority={priority}
    />
  );
}
