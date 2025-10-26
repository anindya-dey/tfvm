import chalk from "chalk";

// Consolidated print utility
type PrintType = 'success' | 'error' | 'info' | 'plain';

export const print = (message: string, type: PrintType = 'plain'): void => {
  switch (type) {
    case 'success':
      console.log(chalk.greenBright(message));
      break;
    case 'error':
      console.log(chalk.redBright(message));
      break;
    case 'info':
      console.log(chalk.blueBright(message));
      break;
    case 'plain':
    default:
      console.log(message);
  }
};

// Legacy exports for backward compatibility (can be removed later)
export const printSuccess = (message: string) => print(message, 'success');
export const printError = (message: string) => print(message, 'error');
export const printInfo = (message: string) => print(message, 'info');
export const printPlainText = (text: string) => print(text, 'plain');

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