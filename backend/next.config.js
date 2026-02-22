const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config
  reactStrictMode: true,
}

module.exports = withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: "ecoshop",
    project: "backend",
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
  }
);
