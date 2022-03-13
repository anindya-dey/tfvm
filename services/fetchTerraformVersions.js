const got = require("got");
const cheerio = require("cheerio");

const { TERRAFORM_DOWNLOAD_URL } = require("../config");
const { printError } = require("../utils/print");
const { isTerraformLink, extractTerraformLink } = require("../utils");

const fetchTerraformVersions = async () => {
  return got(TERRAFORM_DOWNLOAD_URL)
    .then((response) => {
      const $ = cheerio.load(response.body);
      const terraformVersions = [];

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
        printError(
          `Could not connect to ${TERRAFORM_DOWNLOAD_URL}. Check your internet connection!`
        );
      } else {
        printError(err);
      }
      return [];
    });
};

module.exports = fetchTerraformVersions;
