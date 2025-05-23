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
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '10.144.3.200',
        port: '8000',
        pathname: '/**',
      },
    ],
  },
  /* config options here */
}

export default nextConfig
