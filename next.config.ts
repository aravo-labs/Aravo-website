import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 only serves qualities named here - anything else silently falls
    // back to 75. 90 is for the site plan in the gap section: it is flat
    // colour and hairline linework, which is exactly what JPEG compression
    // damages first and most visibly.
    qualities: [75, 90],
  },
};

export default nextConfig;
