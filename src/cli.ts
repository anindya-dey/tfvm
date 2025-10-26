#! /usr/bin/env node

import { defineCommand, runMain } from "citty";
import { TERRAFORM_RELEASE_REPO, STORAGE_DIR } from "./config";
import { list, download, remove, use, dir } from "./commands";
import { checkForUpdates } from "./update-checker";
import pkg from "../package.json";

const main = defineCommand({
  meta: {
    name: "tfvm",
    version: pkg.version,
    description: "Terraform Version Manager - A CLI tool to manage Terraform versions",
  },
  subCommands: {
    list: defineCommand({
      meta: {
        name: "list",
        description: `list all the downloaded versions of terraform or the ones available at ${TERRAFORM_RELEASE_REPO}`,
      },
      args: {
        remote: {
          type: "boolean",
          alias: "r",
          description: `Displays a list of all terraform versions available at ${TERRAFORM_RELEASE_REPO}`,
        },
      },
      run: async ({ args }) => {
        await list({ remote: !!args.remote });
      },
    }),
    ls: defineCommand({
      meta: {
        name: "ls",
        description: "Alias for list command",
      },
      args: {
        remote: {
          type: "boolean",
          alias: "r",
          description: `Displays a list of all terraform versions available at ${TERRAFORM_RELEASE_REPO}`,
        },
      },
      run: async ({ args }) => {
        await list({ remote: !!args.remote });
      },
    }),
    download: defineCommand({
      meta: {
        name: "download",
        description: `downloads and extracts a specific package of terraform from ${TERRAFORM_RELEASE_REPO}`,
      },
      args: {
        version: {
          type: "positional",
          description: "If provided, a list of all the terraform packages for this version would be displayed for the user to choose from",
          required: false,
        },
      },
      run: async ({ args }) => {
        await download(typeof args.version === 'string' ? args.version : undefined);
      },
    }),
    d: defineCommand({
      meta: {
        name: "d",
        description: "Alias for download command",
      },
      args: {
        version: {
          type: "positional",
          description: "If provided, a list of all the terraform packages for this version would be displayed for the user to choose from",
          required: false,
        },
      },
      run: async ({ args }) => {
        await download(typeof args.version === 'string' ? args.version : undefined);
      },
    }),
    remove: defineCommand({
      meta: {
        name: "remove",
        description: `removes a specific package or all packages of terraform saved locally at ${STORAGE_DIR}`,
      },
      args: {
        all: {
          type: "boolean",
          alias: "a",
          description: `remove all versions of terraform from ${STORAGE_DIR}`,
        },
      },
      run: async ({ args }) => {
        await remove({ all: !!args.all });
      },
    }),
    rm: defineCommand({
      meta: {
        name: "rm",
        description: "Alias for remove command",
      },
      args: {
        all: {
          type: "boolean",
          alias: "a",
          description: `remove all versions of terraform from ${STORAGE_DIR}`,
        },
      },
      run: async ({ args }) => {
        await remove({ all: !!args.all });
      },
    }),
    use: defineCommand({
      meta: {
        name: "use",
        description: `sets a specific terraform release from ${STORAGE_DIR} as default which can be used directly in the terminal.`,
      },
      run: async () => {
        await use();
      },
    }),
    dir: defineCommand({
      meta: {
        name: "dir",
        description: `displays the directory where terraform executables are stored. Default directory is ${STORAGE_DIR}.`,
      },
      run: async () => {
        await dir();
      },
    }),
  },
});

// Initialize the CLI
const init = async () => {
  // Check for updates (non-blocking)
  checkForUpdates(pkg.version);
  
  // Run the CLI
  await runMain(main);
};

init();

