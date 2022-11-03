import { Argument, Option, program } from "commander";
import updateNotifier from "update-notifier";

import { TERRAFORM_RELEASE_REPO, HOME_DIR, STORAGE_DIR } from "./configs";

import pkg from "../package.json";
import { dir, download, list, remove } from "./commands";

// > Notify user about any updates
updateNotifier({
  pkg,
  updateCheckInterval: 1000,
}).notify({
  isGlobal: true,
  defer: false,
});

const init = () => {
  program
    .name("tfvm")
    .description(
      "Terraform Version Manager - A CLI tool to manage Terraform versions"
    )
    .version(pkg.version);

  program
    .command("list")
    .alias("ls")
    .description("list all the downloaded versions of terraform")
    .option(
      "-r, --remote",
      `Displays a list of all terraform versions available at ${TERRAFORM_RELEASE_REPO}`
    )
    .action(list);

  program
    .command("download")
    .alias("d")
    .description("downloads a specific version of terraform")
    .argument(
      "[version]",
      "If provided, this version of Terraform would be downloaded. If not, user would see a list of available versions to choose from."
    )
    .action(download);

  program
    .command("remove")
    .alias("rm")
    .description(
      "removes a specific version all versions of terraform downloaded locally"
    )
    .option("-a, --all", `remove all versions of terraform from ${STORAGE_DIR}`)
    .action(remove);

  program
    .command("dir")
    .description(
      `displays the directory where terraform executables are stored. Throws an error if the configured directory does not exist. Default directory is ${HOME_DIR}.`
    )
    .action(dir);

  program.showSuggestionAfterError();

  program.parse();
};

export { init };
