import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration (empty = silence warning, use webpack by default)
  turbopack: {},

  // Experimental features for better stability
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },

  // Image optimization — Netlify handles this automatically via plugin,
  // but we define allowed remote patterns for any future external images.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Logging: reduce noise in production, verbose in development
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },

  // Powered-by header removal (security best practice)
  poweredByHeader: false,

  // Strict-mode for catching issues early in development
  reactStrictMode: true,

  // Webpack configuration for better chunk handling
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize client-side chunk loading
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test(module: any) {
                return (
                  module.size() > 160000 &&
                  /node_modules[/\\]/.test(module.identifier())
                );
              },
              name(module: any) {
                const hash = require('crypto');
                const md5 = hash.createHash('md5');
                md5.update(module.identifier());
                return md5.digest('hex').substring(0, 8);
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
            },
            shared: {
              name(module: any, chunks: any[]) {
                return (
                  chunks.map(chunk => chunk.name).join('~') + '_shared'
                );
              },
              priority: 10,
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
