import { program } from "commander";
import updateNotifier from "update-notifier";

import list from "./commands/list";
import download from "./commands/download";
import dir from "./commands/dir";
import { TERRAFORM_RELEASE_REPO, HOME_DIR } from "./configs";

// // > Notify user about any updates
import pkg from "../package.json";
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
    .description("List all the downloaded versions of terraform")
    .option(
      "-a, --available",
      `Displays a list of all terraform versions available at ${TERRAFORM_RELEASE_REPO}`
    )
    .action(list);

  program
    .command("download")
    .alias("d")
    .description("Downloads a specific version of terraform")
    .argument(
      "[version]",
      "If provided, this version of Terraform would be downloaded. If not, user would see a list of available versions to choose from."
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
};

export { init };
