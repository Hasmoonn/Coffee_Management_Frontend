import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  // Performance optimizations
  swcMinify: true, // Use SWC for faster minification
  productionBrowserSourceMaps: false, // Reduce bundle size in production
  
  // Image optimization
  images: {
    // Enable AVIF format for better compression
    formats: ['image/avif', 'image/webp'],
    // Cloudinary domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Optimize image serving
    minimumCacheTTL: 31536000, // 1 year for static images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  


  // Experimental features for performance
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  // Compression
  compress: true,
  
  // Powering the default cache revalidation
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 60 seconds
    pagesBufferLength: 5,
  },
};

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withAnalyzer(nextConfig);