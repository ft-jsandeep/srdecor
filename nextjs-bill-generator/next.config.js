/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['firebaseapp.com'],
  },
  webpack: (config, { isServer }) => {
    // Handle undici module parsing issues
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    })
    
    // Exclude undici from processing
    config.externals = config.externals || []
    if (isServer) {
      config.externals.push('undici')
    }
    
    return config
  },
  transpilePackages: ['undici'],
}

module.exports = nextConfig
