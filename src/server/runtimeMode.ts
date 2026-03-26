function isVercelDeployment(): boolean {
  return Boolean(process.env.VERCEL ?? process.env.VERCEL_ENV);
}

export function isProductionDeployment(): boolean {
  return process.env.NODE_ENV === "production" && isVercelDeployment();
}

export function canUseEphemeralPersistenceFallback(): boolean {
  return !isVercelDeployment();
}

export function requiresDistributedProtection(): boolean {
  return isVercelDeployment();
}
