import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.12"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lmpbvjycbunqjonqafmh.supabase.co" },
    ],
  },
};

export default nextConfig;
