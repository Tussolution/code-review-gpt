import { exec } from "child_process";
import { join } from "path";

import { getGitHubEnvVariables, getGitLabEnvVariables } from "../../config";
import { PlatformOptions } from "../types";

export const getChangedFilesNamesCommand = (
  platform: string | undefined
): string => {
  if (platform === PlatformOptions.GITHUB) {
    const { githubSha, baseSha } = getGitHubEnvVariables();

    return `git diff --name-only --diff-filter=AMRT ${baseSha} ${githubSha}`;
  } else if (platform === PlatformOptions.GITLAB) {
    const { gitlabSha, mergeRequestBaseSha } = getGitLabEnvVariables();

    return `git diff --name-only --diff-filter=AMRT ${mergeRequestBaseSha} ${gitlabSha}`;
  }

  return "git diff --name-only --diff-filter=AMRT --cached";
};

export const getChangedFilesNames = async (
  platform: string | undefined
): Promise<string[]> => {
  const commandString = getChangedFilesNamesCommand(platform);

  return new Promise((resolve, reject) => {
    exec(commandString, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Failed to execute command. Error: ${error.message}`));
      } else if (stderr) {
        reject(new Error(`Command execution error: ${stderr}`));
      } else {
        const files = stdout
          .split("\n")
          .filter((fileName) => fileName.trim() !== "")
          .map((fileName) => join(process.cwd(), fileName.trim()));
        resolve(files);
      }
    });
  });
};
