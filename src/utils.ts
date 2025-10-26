import chalk from "chalk";

// Print utilities
export const printSuccess = (message: string) => console.log(chalk.greenBright(message));
export const printError = (message: string) => console.log(chalk.redBright(message));
export const printInfo = (message: string) => console.log(chalk.blueBright(message));
export const printPlainText = (text: string) => console.log(text);

// Terraform link validation
export const isTerraformLink = (linkHref: string | null | undefined): boolean => {
  if (!linkHref || typeof linkHref !== 'string') {
    return false;
  }
  return linkHref.includes("/terraform/") && 
    /\/+terraform\/+[0-9]+\.[0-9]+\.[0-9]+(?:[-][a-zA-Z0-9\.\-]+)?(?:\/|$)/.test(linkHref);
};

// Extract terraform version from link
export const extractTerraformVersion = (linkHref: string | null | undefined): string | null => {
  if (!linkHref || typeof linkHref !== 'string') {
    return null;
  }
  
  const terraformMatch = linkHref.match(/.*\/terraform\/+([0-9]+\.[0-9]+\.[0-9]+(?:[-][a-zA-Z0-9\.\-]+)?)(?:\/|$)/);
  
  if (terraformMatch && terraformMatch[1]) {
    const versionString = terraformMatch[1];
    const [baseVersion] = versionString.split('-');
    const versionParts = baseVersion.split('.');
    
    if (versionParts.length === 3 && versionParts.every(part => /^\d+$/.test(part))) {
      return versionString;
    }
  }
  
  return null;
};

// Check if file is a zip package
export const isZipPackage = (linkHref: string | null | undefined): boolean => {
  if (!linkHref || typeof linkHref !== 'string') {
    return false;
  }
  return linkHref.endsWith(".zip") && linkHref.length > 4;
};