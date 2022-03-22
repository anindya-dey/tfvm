const cheerio = require("cheerio");
const got = require("got");

const { TERRAFORM_DOWNLOAD_URL } = require("../config");
const { printError } = require("../utils/print");

function isTerraformLink(i, link) {
  // Return false if there is no href attribute.
  if (typeof link.attribs.href === "undefined") {
    return false;
  }

  return link.attribs.href.startsWith("/terraform/");
}

function getTerraformVersions() {
  const terraformVersions = [];

  return got(TERRAFORM_DOWNLOAD_URL)
    .then((response) => {
      const $ = cheerio.load(response.body);

      $("a")
        .filter(isTerraformLink)
        .each((i, link) => {
          const href = link.attribs.href
            .replace(/^\/terraform\//, "")
            .replace(/\/$/, "");
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
        printError("Something is wrong. Please try again later.");
      }
    });
}

module.exports = getTerraformVersions;
