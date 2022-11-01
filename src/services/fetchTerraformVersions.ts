import got from "got";
import { load } from "cheerio";

import { TERRAFORM_DOWNLOAD_URL } from "../configs";
import { isTerraformLink, extractTerraformLink } from "../utils";

const fetchTerraformVersions = async () => {
  return got(TERRAFORM_DOWNLOAD_URL)
    .then((response) => {
      const $ = load(response.body);
      const terraformVersions: string[] = [];

      $("a")
        .filter((_, link) => isTerraformLink(link))
        .each((i, link) => {
          const href = extractTerraformLink(link);
          terraformVersions.push(href);
        });
      return terraformVersions;
    })
    .catch((err) => {
      if (err.code === "ENOTFOUND") {
        throw new Error(
          `Could not connect to ${TERRAFORM_DOWNLOAD_URL}. Check your internet connection!`
        );
      } else {
        throw new Error(err);
      }
    });
};

export default fetchTerraformVersions;
