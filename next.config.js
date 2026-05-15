/** @type {import('next').NextConfig} */

const supabasePatterns = [
  {
    protocol: "https",
    hostname: "**.supabase.co",
    pathname: "/storage/v1/object/public/**",
  },
];

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const { hostname } = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    supabasePatterns.unshift({
      protocol: "https",
      hostname,
      pathname: "/storage/v1/object/public/**",
    });
  } catch {
    // ignore invalid URL at build time
  }
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: supabasePatterns,
  },
};

module.exports = nextConfig;
