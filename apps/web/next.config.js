/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@repo/core-domain",
    "@repo/ui",
    "@repo/guides",
    "@repo/adapters-etf",
    "@repo/adapters-bonds",
    "@repo/adapters-structured",
    "@repo/adapters-scpi",
    "@repo/rules-engine",
    "@repo/portfolio-engine",
    "@repo/data-ingestion",
    "@repo/reporting",
  ],
};

module.exports = nextConfig;
