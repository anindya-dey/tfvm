import cheerio from "cheerio";
import got from "got";

import { TERRAFORM_DOWNLOAD_URL } from "../configs";
import {
  isTerraformLink,
  extractTerraformExecutable,
  isTerraformPackage,
} from "../utils";

const listTerraformExecutables = async (version: string) => {
  return got(`${TERRAFORM_DOWNLOAD_URL}/${version}/`)
    .then((response) => {
      const terraformExecutables: string[] = [];
      const $ = cheerio.load(response.body);

      $("a")
        .filter((_, link) => isTerraformLink(link))
        .each((i, link) => {
          if (isTerraformPackage(link)) {
            const href = extractTerraformExecutable(link);
            terraformExecutables.push(href);
          }
        });

      return terraformExecutables;
    })
    .catch((err) => {
      if (err.code === "ENOTFOUND") {
        throw new Error(
          `Could not connect to ${TERRAFORM_DOWNLOAD_URL}. Check your internet connection!`
        );
      } else if (err.code === "ERR_NON_2XX_3XX_RESPONSE") {
        throw new Error(
          `Could not download version "${version}". Check if the version is correct, or you have permission to download it!`
        );
      } else {
        throw new Error(err);
      }
    });
};

export default listTerraformExecutables;
