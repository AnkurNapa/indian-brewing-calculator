/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const isCapacitor = process.env.BUILD_TARGET === 'capacitor';
const repoName = 'indian-brewing-calculator';

const nextConfig = {
  output: 'export',
  // Only apply basePath/assetPrefix for the GitHub Pages production build.
  // The Capacitor (iOS) build serves from the webview root, so it must not
  // have a basePath, and `next dev` needs the site root too.
  basePath: isProd && !isCapacitor ? `/${repoName}` : '',
  assetPrefix: isProd && !isCapacitor ? `/${repoName}/` : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
