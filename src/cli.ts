#! /usr/bin/env node

import { defineCommand, runMain } from "citty";
import { TERRAFORM_RELEASE_REPO, STORAGE_DIR } from "./config";
import { list, download, remove, use, pin, which, dir } from "./commands";
import { checkForUpdates } from "./update-checker";
import pkg from "../package.json";

const listArgs = {
  remote: {
    type: "boolean",
    alias: "r",
    description: `Displays a list of all terraform versions available at ${TERRAFORM_RELEASE_REPO}`,
  },
  json: {
    type: "boolean",
    alias: "j",
    description: "Output machine-readable JSON",
  },
} as const;

const downloadArgs = {
  version: {
    type: "positional",
    description: "Terraform version to download, e.g. 1.6.0. Omit to browse.",
    required: false,
  },
  force: {
    type: "boolean",
    alias: "f",
    description: "Re-download even if the version is already installed",
  },
} as const;

const removeArgs = {
  version: {
    type: "positional",
    description: "Terraform version to remove. Omit to select interactively.",
    required: false,
  },
  all: {
    type: "boolean",
    alias: "a",
    description: `remove all versions of terraform from ${STORAGE_DIR}`,
  },
  yes: {
    type: "boolean",
    alias: "y",
    description: "Skip the confirmation prompt",
  },
} as const;

const asVersion = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

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
      args: listArgs,
      run: async ({ args }) => {
        await list({ remote: !!args.remote, json: !!args.json });
      },
    }),
    ls: defineCommand({
      meta: {
        name: "ls",
        description: "Alias for list command",
      },
      args: listArgs,
      run: async ({ args }) => {
        await list({ remote: !!args.remote, json: !!args.json });
      },
    }),
    download: defineCommand({
      meta: {
        name: "download",
        description: `downloads and extracts a specific package of terraform from ${TERRAFORM_RELEASE_REPO}`,
      },
      args: downloadArgs,
      run: async ({ args }) => {
        await download(asVersion(args.version), { force: !!args.force });
      },
    }),
    d: defineCommand({
      meta: {
        name: "d",
        description: "Alias for download command",
      },
      args: downloadArgs,
      run: async ({ args }) => {
        await download(asVersion(args.version), { force: !!args.force });
      },
    }),
    remove: defineCommand({
      meta: {
        name: "remove",
        description: `removes a specific package or all packages of terraform saved locally at ${STORAGE_DIR}`,
      },
      args: removeArgs,
      run: async ({ args }) => {
        await remove({ all: !!args.all, yes: !!args.yes }, asVersion(args.version));
      },
    }),
    rm: defineCommand({
      meta: {
        name: "rm",
        description: "Alias for remove command",
      },
      args: removeArgs,
      run: async ({ args }) => {
        await remove({ all: !!args.all, yes: !!args.yes }, asVersion(args.version));
      },
    }),
    use: defineCommand({
      meta: {
        name: "use",
        description: `sets a specific terraform release from ${STORAGE_DIR} as default which can be used directly in the terminal.`,
      },
      args: {
        version: {
          type: "positional",
          description: "Terraform version to activate. Omit to select interactively.",
          required: false,
        },
      },
      run: async ({ args }) => {
        await use(asVersion(args.version));
      },
    }),
    pin: defineCommand({
      meta: {
        name: "pin",
        description: `writes a ${".terraform-version"} file in the current directory so the terraform shim uses that version here`,
      },
      args: {
        version: {
          type: "positional",
          description: "Version to pin. Omit to pin the currently active version.",
          required: false,
        },
      },
      run: async ({ args }) => {
        await pin(asVersion(args.version));
      },
    }),
    which: defineCommand({
      meta: {
        name: "which",
        description: "prints the path of the active terraform version",
      },
      run: async () => {
        await which();
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

const FAST_PATH_FLAGS = new Set(["--version", "-v", "--help", "-h"]);

// Initialize the CLI
const init = async () => {
  const isFastPath = process.argv.slice(2).some((arg) => FAST_PATH_FLAGS.has(arg));

  // Await the update check so its banner prints before command output and the
  // cache is actually persisted. Skipped for --version/--help to stay instant.
  if (!isFastPath) {
    await checkForUpdates(pkg.version);
  }

  // Run the CLI
  await runMain(main);
};

init();
