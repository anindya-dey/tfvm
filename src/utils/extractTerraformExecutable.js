const extractTerraformExecutable = (link) => {
  return link.attribs.href.replace(/^\/terraform\//, "").replace(/\/$/, "");
};

export default extractTerraformExecutable;
