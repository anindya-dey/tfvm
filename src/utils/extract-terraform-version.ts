const extractTerraformVersion = (linkHref: string) => {
  return linkHref.includes("terraform")
    ? linkHref.replace(/terraform/, "").replace(/\//g, "")
    : null;
};

export default extractTerraformVersion;
