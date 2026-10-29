import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const ROOT = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: ROOT,
  // Images are hosted on imgbb / arbitrary URLs pasted by users — served as-is.
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  // Proxy the API through Next so the auth cookie is first-party (same origin).
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${BACKEND_URL}/api/:path*` }];
  },
};

export default nextConfig;
