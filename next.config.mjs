/** @type {import('next').NextConfig} */
const nextConfig = {
  // This is required in Next.js 16 to allow custom webpack rules
  turbopack: {}, 
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        child_process: false,
        canvas: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;