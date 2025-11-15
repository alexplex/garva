import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  outputFileTracingIncludes: {
    '/': ['./node_modules/.prisma/client/libquery_engine-*'],
    '/api/**/*': ['./node_modules/.prisma/client/libquery_engine-*'],
  },
};

export default nextConfig;
