/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_PAGES === 'true'

const nextConfig = {
  output: isGitHubPages ? 'export' : undefined,
  basePath: isGitHubPages ? '/CS-370-Justice-AI-Project' : '',
  assetPrefix: isGitHubPages ? '/CS-370-Justice-AI-Project/' : '',
}

module.exports = nextConfig
