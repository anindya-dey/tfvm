const extractTerraformLink = (link) => {
  return link?.attribs?.href?.replace(/^\/terraform\//, "").replace(/\/$/, "");
};

module.exports = extractTerraformLink;
