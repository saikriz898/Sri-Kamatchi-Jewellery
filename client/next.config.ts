import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        assert: require.resolve('assert/'),
        buffer: require.resolve('buffer/'),
      };
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://sri-kamatchi-jewellery-68kz.onrender.com'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
