import type { NextConfig } from "next";

const apiTarget = process.env.API_PROXY_TARGET ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/backend-api/:path*", destination: `${apiTarget}/:path*` }];
  },
};

export default nextConfig;
