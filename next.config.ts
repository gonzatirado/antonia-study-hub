import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['firebase', '@firebase/firestore', '@firebase/auth', '@firebase/storage', '@firebase/app'],
};

export default nextConfig;
