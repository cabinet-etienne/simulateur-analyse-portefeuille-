/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/core-domain", "@repo/ui", "@repo/db"],
};

module.exports = nextConfig;
