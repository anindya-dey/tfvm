import pc from "picocolors";

// Consolidated print utility
type PrintType = 'success' | 'error' | 'info' | 'plain';

export const print = (message: string, type: PrintType = 'plain'): void => {
  switch (type) {
    case 'success':
      console.log(pc.green(message));
      break;
    case 'error':
      console.log(pc.red(message));
      break;
    case 'info':
      console.log(pc.blue(message));
      break;
    case 'plain':
    default:
      console.log(message);
  }
};

export const printInfo = (message: string) => print(message, 'info');

// Validate a user-supplied Terraform version before it is used in a URL/path
export const isValidVersion = (version: string): boolean =>
  /^[0-9]+\.[0-9]+\.[0-9]+(?:[-+][0-9A-Za-z.-]+)?$/.test(version.trim());

// Human-readable byte sizes for `tfvm list`
export const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${unit === 0 || value >= 100 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
};

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
