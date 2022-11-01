const isZipPackage = (linkHref: string) => {
  return linkHref.endsWith(".zip");
};

export default isZipPackage;
