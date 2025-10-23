/** @type {import('next').NextConfig} */
const { join } = require('path');

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000',
  },
  output: {
    // Configuramos explícitamente la raíz del workspace
    fileTracingRoot: join(__dirname, '..'),
  },
}

module.exports = nextConfig
