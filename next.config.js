const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    domains: [
      // NextJS <Image> component needs to whitelist domains for src={}
      "lh3.googleusercontent.com",
      "pbs.twimg.com",
      "images.unsplash.com",
      "logos-world.net",
      "via.placeholder.com",
      "avatar.vercel.sh",
      "www.apple.com",
      "www.amazon.com",
      "www.facebook.com",
      "www.netflix.com",
      "www.google.com"
    ],
  },
};

module.exports = withNextIntl(nextConfig);
