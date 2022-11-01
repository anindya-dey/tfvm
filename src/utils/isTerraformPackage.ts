import { Element } from "cheerio";

const isTerraformPackage = (link: Element) => {
  return link.attribs.href?.endsWith(".zip");
};

export default isTerraformPackage;
