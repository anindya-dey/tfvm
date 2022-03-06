#! /usr/bin/env node

import { program } from "commander";
import updateNotifier from "update-notifier";
import boxen from "boxen";

import list from "./commands/list.js";
import download from "./commands/download.js";
import dir from "./commands/dir.js";

import { TERRAFORM_DOWNLOAD_URL, STORAGE_DIR, HOME_DIR } from "./config.js";

// Notify user about any updates
// import pkg from './package.json';
// updateNotifier({pkg}).notify();

console.log(
  boxen("Welcome to \nTerraform Version Manager \n\n v0.2.9", {
    padding: 2,
    margin: {
      top: 2,
      bottom: 2
    },
    title: "TFVM",
    titleAlignment: "center",
    textAlignment: "center",
  })
);

program.name("tfvm");

program
  .command("list")
  .alias("ls")
  .description("List all the downloaded versions of terraform")
  .option(
    "-r, --remote",
    `Displays a list of terraform versions available at ${TERRAFORM_DOWNLOAD_URL}`
  )
  .action(list);

program
  .command("download [version]")
  .alias("d")
  .description(
    "Downloads the latest version, or a specific version of terraform"
  )
  .action(download);

program
  .command("dir")
  .description(
    `Displays the directory where terraform executables are stored. Throws an error if the configured directory does not exist. Default directory is ${HOME_DIR}.`
  )
  .action(dir);

program.showSuggestionAfterError();

program.parse();
