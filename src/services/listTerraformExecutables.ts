import { load } from "cheerio";
import got from "got";

import { TERRAFORM_RELEASE_REPO } from "../configs";
import { isTerraformLink, isZipPackage } from "../utils";

const listTerraformExecutables = async (version: string) => {
  return got(`${TERRAFORM_RELEASE_REPO}/${version}/`)
    .then((response) => {
      const terraformExecutables: string[] = [];
      const $ = load(response.body);

      $("a")
        .filter(
          (_, link) =>
            isTerraformLink(link.attribs?.href) &&
            isZipPackage(link.attribs?.href)
        )
        .each((i, link) => {
          terraformExecutables.push(link.attribs?.href);
        });

      return terraformExecutables;
    })
    .catch((err) => {
      if (err.code === "ENOTFOUND") {
        throw new Error(
          `Could not connect to ${TERRAFORM_RELEASE_REPO}. Check your internet connection!`
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
