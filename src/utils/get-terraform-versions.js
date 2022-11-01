import cheerio from "cheerio";
import got from "got";

import { TERRAFORM_DOWNLOAD_URL } from "../config";
import { isTerraformLink, printError } from "../utils/print";

const getTerraformVersions = () => {
  const terraformVersions = [];

  return got(TERRAFORM_DOWNLOAD_URL)
    .then((response) => {
      const $ = cheerio.load(response.body);

      $("a")
        .filter((_, link) => isTerraformLink(link))
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
          `Could not connect to ${TERRAFORM_DOWNLOAD_URL}. Check your internet connection!`
        );
      } else {
        printError("Something is wrong. Please try again later.");
      }
    });
}

export default getTerraformVersions;
