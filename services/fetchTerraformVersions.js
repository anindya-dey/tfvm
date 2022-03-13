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

module.exports = fetchTerraformVersions;
