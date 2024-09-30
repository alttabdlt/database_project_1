const nextConfig = {
  // ... your existing Next.js config
  webpack: (config) => {
    config.resolve.alias['@'] = new URL('.', import.meta.url).pathname
    return config
  },
}

export default nextConfig