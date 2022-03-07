const isTerraformLink = (link) => {
//   if (typeof link.attribs.href === "undefined") {
//     return false;
//   }

  return link?.attribs?.href?.includes("/terraform/");
};

export default isTerraformLink;
