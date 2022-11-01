import { Element } from "cheerio";

const isTerraformLink = (link: Element) => {
  return link.attribs.href?.includes("/terraform/");
};

export default isTerraformLink;
