import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  serverExternalPackages: ['@libsql/client', 'libsql'],
};

export default nextConfig;
