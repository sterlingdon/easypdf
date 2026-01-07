import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  /* config options here */
  basePath: "/easypdf", // Add this line matching your repo name
  images: {
    unoptimized: true, // Necessary for static export on GitHub Pages
  },
};

export default nextConfig;
