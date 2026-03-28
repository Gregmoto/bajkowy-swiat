/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pakiety wymagające Node.js runtime — nie bundlować dla Edge
  // Next.js 14: experimental.serverComponentsExternalPackages
  // Next.js 15: serverExternalPackages (top-level)
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs", "prisma"],
  },
};

export default nextConfig;
