/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'video-product.cdn.minimax.io',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default nextConfig;
