const isTerraformLink = (linkHref: string) => {
  return linkHref.includes("/terraform/");
};

export default isTerraformLink;
