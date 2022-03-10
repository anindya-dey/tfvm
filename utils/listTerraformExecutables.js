const cheerio = require("cheerio");
const got = require("got");
const { TERRAFORM_DOWNLOAD_URL } = require("../config");
const isTerraformLink = require("./isTerraformLink");
const extractTerraformExecutable = require("./extractTerraformExecutable");

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

module.exports = listTerraformExecutables;
