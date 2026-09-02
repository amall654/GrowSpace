const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGitHubPagesBuild && repositoryName ? `/${repositoryName}` : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: isGitHubPagesBuild && repositoryName ? `/${repositoryName}` : "",
  },
};

export default nextConfig;
