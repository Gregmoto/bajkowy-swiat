/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pakiety wymagające Node.js runtime — nie bundlować dla Edge
  serverExternalPackages: ["@prisma/client", "bcryptjs", "prisma"],
};

export default nextConfig;
