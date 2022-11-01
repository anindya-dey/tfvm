import { load } from "cheerio";
import got from "got";

import { TERRAFORM_RELEASE_REPO } from "../configs";
import { printError } from "./print";
import isTerraformLink from "./is-terraform-link";

const getTerraformVersions = () => {
  const terraformVersions: string[] = [];

  return got(TERRAFORM_RELEASE_REPO)
    .then((response) => {
      const $ = load(response.body);

      $("a")
        .filter((_, link) => isTerraformLink(link.attribs?.href))
        .each((_, link) => {
          const href = link.attribs.href
            .replace(/^\/terraform\//, "")
            .replace(/\/$/, "");
          terraformVersions.push(href);
        });

      return terraformVersions;
    })
    .catch((err) => {
      if (err.code === "ENOTFOUND") {
        printError(
          `Could not connect to ${TERRAFORM_RELEASE_REPO}. Check your internet connection!`
        );
      } else {
        printError("Something is wrong. Please try again later.");
      }
    });
};

export default getTerraformVersions;
