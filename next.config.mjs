/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {}, 
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
        ],
      },
    ];
  },

  // 3. Webpack fallbacks for MediaPipe/WASM
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