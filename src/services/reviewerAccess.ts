const DEFAULT_REVIEW_EMAIL = 'review@blisse.online';

const splitEmails = (raw: string): string[] => (
  raw
    .split(/[,\s;]+/)
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
);

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const getPublicEnvValue = (key: string): string => {
  try {
    const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
    const value = env?.[key];
    return typeof value === 'string' ? value : '';
  } catch {
    return '';
  }
};

export const getReviewerBypassEmails = (): string[] => {
  const fromSingle = splitEmails(getPublicEnvValue('EXPO_PUBLIC_REVIEW_BYPASS_EMAIL'));
  const fromList = splitEmails(getPublicEnvValue('EXPO_PUBLIC_REVIEW_BYPASS_EMAILS'));
  return Array.from(new Set([DEFAULT_REVIEW_EMAIL, ...fromSingle, ...fromList]));
};

export const isReviewerBypassEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const normalized = normalizeEmail(email);
  return getReviewerBypassEmails().includes(normalized);
};
