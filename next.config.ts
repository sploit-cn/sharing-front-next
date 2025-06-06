import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/openapi.json',
        destination: 'http://10.144.3.200:8000/openapi.json',
      },
      {
        source: '/api/:path*',
        destination: 'http://10.144.3.200:8000/:path*',
      },
      {
        source: '/static/:path*',
        destination: 'http://10.144.3.200:8000/static/:path*',
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        hostname: '**',
        pathname: '/**',
      },
    ],
  },
  /* config options here */
}

export default nextConfig
