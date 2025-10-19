/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com'],
    unoptimized: true, // Required for static export
  },
  // Enable standalone output for better Firebase Hosting compatibility
  output: 'export',
  // Exclude functions folder from build
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'firebase-functions': 'commonjs firebase-functions',
        'firebase-admin': 'commonjs firebase-admin',
      });
    }
    return config;
  },
}

module.exports = nextConfig
