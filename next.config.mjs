/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // Ignore 'puppeteer-core' and 'chrome-aws-lambda' modules for Webpack
    config.externals = ['puppeteer-core', 'chrome-aws-lambda'];

    return config;
  },
};

export default nextConfig;
