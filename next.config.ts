import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Next.js 16 DevTools overlay (Shadow DOM panel at
  // z-index: 2147483646 with position: fixed that blocks all
  // pointer events on child pages in development).
  devIndicators: false,
};

export default nextConfig;