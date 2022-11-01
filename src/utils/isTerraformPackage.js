const isTerraformPackage = (link) => {
  if (typeof link.attribs.href === "undefined") {
    return false;
  }

  return link.attribs.href.endsWith(".zip");
};

module.exports = isTerraformPackage;
