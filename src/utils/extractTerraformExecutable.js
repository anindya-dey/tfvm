const extractTerraformExecutable = (link) => {
  return link.attribs.href.replace(/^\/terraform\//, "").replace(/\/$/, "");
};

module.exports = extractTerraformExecutable;
