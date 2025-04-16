import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  // Ensure proper handling of environment variables
  serverRuntimeConfig: {
    MONGO_URI: process.env.MONGO_URI,
  },
  // Enable strict mode for better development experience
  reactStrictMode: true,
};

export default nextConfig;
