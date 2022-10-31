#! /usr/bin/env node

const { program } = require("commander");
const updateNotifier = require("update-notifier");

const list = require("./commands/list");
const download = require("./commands/download.js");
const dir = require("./commands/dir.js");
const { TERRAFORM_DOWNLOAD_URL, HOME_DIR } = require("./config.js");

// > Notify user about any updates
const pkg = require("./package.json");
updateNotifier({ pkg }).notify();

program
  .name("tfvm")
  .description("A CLI tool to manage Terraform versions")
  .version(pkg.version);

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
  .command("download")
  .alias("d")
  .description(
    "Downloads the latest version, or a specific version of terraform"
  )
  .argument("[version]", "Version of Terraform you want to download")
  .action(download);

program
  .command("dir")
  .description(
    `Displays the directory where terraform executables are stored. Throws an error if the configured directory does not exist. Default directory is ${HOME_DIR}.`
  )
  .action(dir);

program.showSuggestionAfterError();

program.parse();
