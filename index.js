#! /usr/bin/env node
import { program } from "commander";
// import updateNotifier from "update-notifier";
import ora from "ora";

import list from "./commands/list.js";
import download from "./commands/download.js";
import dir from "./commands/dir.js";
import {
  TERRAFORM_DOWNLOAD_URL,
  STORAGE_DIR,
  HOME_DIR,
} from "./config.js";

// // Notify user about any updates
// import pkg from "./package.json";
// updateNotifier({ pkg }).notify();

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

const spinner = ora('Loading unicorns').start();

setTimeout(() => {
	spinner.color = 'yellow';
	spinner.text = 'Loading rainbows';
}, 1000);
