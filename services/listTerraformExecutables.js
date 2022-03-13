const cheerio = require("cheerio");
const got = require("got");

const { TERRAFORM_DOWNLOAD_URL } = require("../config.js");
const { printError, isTerraformLink, extractTerraformExecutable } = require("../utils");

const listTerraformExecutables = async (version) => {
  return got(`${TERRAFORM_DOWNLOAD_URL}/${version}/`)
    .then((response) => {
      const terraformExecutables = [];
      const $ = cheerio.load(response.body);

      $("a")
        .filter((_, link) => isTerraformLink(link))
        .each((i, link) => {
          const href = extractTerraformExecutable(link);
          terraformExecutables.push(href);
        });

      return terraformExecutables;
    })
    .catch((err) => {
      if (err.code === "ENOTFOUND") {
        printError(
          `Could not connect to ${TERRAFORM_DOWNLOAD_URL}. Check your internet connection!`
        );
      } else {
        printError(err);
      }
      return [];
    });
};

module.exports = listTerraformExecutables;
