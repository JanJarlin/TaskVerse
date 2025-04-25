/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Habilitar salida standalone para Docker
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
