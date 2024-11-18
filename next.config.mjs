/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false, // Disables React Strict Mode

    webpack: (config) => {
        config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm'
        config.experiments = { ...config.experiments, asyncWebAssembly: true }
        return config
      }
};



export default nextConfig;
