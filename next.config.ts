import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["worldwide-ones-cached-staff.trycloudflare.com "],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "**.githubusercontent.com" },
      { protocol: "https", hostname: "902d51wy0g.ufs.sh" },
    ],
  },
};

export default nextConfig;
