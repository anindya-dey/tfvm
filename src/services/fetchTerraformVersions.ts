import got from "got";
import { load } from "cheerio";

import { TERRAFORM_RELEASE_REPO } from "../configs";
import { isTerraformLink, extractTerraformVersion } from "../utils";

const fetchTerraformVersions = async () => {
  return got(TERRAFORM_RELEASE_REPO)
    .then((response) => {
      const $ = load(response.body);
      const terraformVersions: string[] = [];

      $("a")
        .filter((_, link) => isTerraformLink(link.attribs?.href))
        .each((_, link) => {
          const href = extractTerraformVersion(link.attribs?.href);
          href && terraformVersions.push(href);
        });

      return terraformVersions;
    })
    .catch((err) => {
      if (err.code === "ENOTFOUND") {
        throw new Error(
          `Could not connect to ${TERRAFORM_RELEASE_REPO}. Check your internet connection!`
        );
      } else {
        throw new Error(err);
      }
    });
};

export default fetchTerraformVersions;
