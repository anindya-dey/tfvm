const cheerio = require("cheerio");
const got = require("got");

const { TERRAFORM_DOWNLOAD_URL } = require("../configs");
const {
  isTerraformLink,
  extractTerraformExecutable,
  isTerraformPackage,
} = require("../utils");

const listTerraformExecutables = async (version) => {
  return got(`${TERRAFORM_DOWNLOAD_URL}/${version}/`)
    .then((response) => {
      const terraformExecutables = [];
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

module.exports = listTerraformExecutables;
