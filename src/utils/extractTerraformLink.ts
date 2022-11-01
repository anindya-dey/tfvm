import { Element } from "cheerio";

const extractTerraformLink = (link: Element) => {
  return link.attribs.href?.replace(/^\/terraform\//, "").replace(/\/$/, "");
};

export default extractTerraformLink;
