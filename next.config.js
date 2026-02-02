/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Image optimization for Vercel
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
    ],
    // Optimize images for faster loading
    formats: ['image/avif', 'image/webp'],
  },
  
  // Optimize for production
  poweredByHeader: false,
  
  // Compress responses
  compress: true,
  
  // Logging for debugging (production)
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
  
  // Experimental features for better performance
  experimental: {
    // Optimize package imports for tree-shaking
    optimizePackageImports: ['@supabase/supabase-js'],
  },
}

module.exports = nextConfig
