import * as cheerio from "cheerio";
import got from "got";

import { TERRAFORM_DOWNLOAD_URL } from "../config.js";
import isTerraformLink from "./isTerraformLink.js";
import extractTerraformExecutable from "./extractTerraformExecutable.js";

const listTerraformExecutables = async (version) => {
  const terraformExecutables = [];

  await got(`${TERRAFORM_DOWNLOAD_URL}/${version}/`).then((response) => {
    const $ = cheerio.load(response.body);

    $("a")
      .filter((_, link) => isTerraformLink(link))
      .each((i, link) => {
        const href = extractTerraformExecutable(link);
        terraformExecutables.push(href);
      });
  });

  return terraformExecutables;
};

export default listTerraformExecutables;
