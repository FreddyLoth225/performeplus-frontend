import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone', // Pour réduire la taille et les besoins en mémoire
};

export default nextConfig;
