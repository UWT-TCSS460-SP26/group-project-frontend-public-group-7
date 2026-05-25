/**
 * Intentionally minimal for the lecture demo. Production Next.js apps
 * configure things like `images.remotePatterns`, custom `headers()`,
 * `redirects()`, and bundle analysis here. None of that adds anything to
 * the auth/forms/RSC story this repo teaches, so the file stays empty.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org' },
    ],
  },
};

export default nextConfig;
