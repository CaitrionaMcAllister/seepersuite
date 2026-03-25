/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow image optimisation from Supabase storage (add your project URL)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
