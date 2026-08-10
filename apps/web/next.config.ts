import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiTarget = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    let cleanTarget = apiTarget.endsWith('/') ? apiTarget.slice(0, -1) : apiTarget;
    if (!cleanTarget.endsWith('/api/v1')) cleanTarget += '/api/v1';

    return [
      {
        source: '/api/v1/:path*',
        destination: `${cleanTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
