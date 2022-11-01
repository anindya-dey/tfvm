import { Element } from "cheerio";

const extractTerraformExecutable = (link: Element) => {
  return link.attribs.href?.replace(/^\/terraform\//, "").replace(/\/$/, "");
};

export default extractTerraformExecutable;
