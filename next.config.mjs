/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress specific warnings from Supabase dependencies
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^bufferutil|^utf-8-validate$/,
      })
    );
    return config;
  },
};

export default nextConfig;