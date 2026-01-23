/**
 * Blocked free email domains for signup (features.md 4.1).
 * Students: require university-owned domains (configurable).
 * All roles: block common free providers.
 */
export const BLOCKED_FREE_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "yahoo.com",
  "yahoo.co.jp",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "mail.com",
  "zoho.com",
  "yandex.com",
  "gmx.com",
  "gmx.net",
  "tutanota.com",
  "fastmail.com",
  "mail.ru",
  "qq.com",
  "163.com",
  "126.com",
  "naver.com",
  "daum.net",
  "hanmail.net",
  "web.de",
  "orange.fr",
  "free.fr",
  "laposte.net",
  "wp.pl",
  "o2.pl",
  "seznam.cz",
  "rediffmail.com",
  "cox.net",
  "att.net",
  "sbcglobal.net",
  "verizon.net",
  "comcast.net",
  "charter.net",
  "earthlink.net",
  "juno.com",
  "netzero.com",
  "ymail.com",
  "rocketmail.com",
  "btinternet.com",
  "virginmedia.com",
  "sky.com",
  "ntlworld.com",
  "blueyonder.co.uk",
  "fsnet.co.uk",
  "talktalk.net",
  "google.com",
  "example.com",
  "test.com",
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "10minutemail.com",
  "throwaway.email",
];

export function getEmailDomain(email: string): string | null {
  const parts = String(email || "").trim().toLowerCase().split("@");
  return parts.length === 2 ? parts[1] : null;
}

export function isBlockedFreeDomain(email: string): boolean {
  const domain = getEmailDomain(email);
  if (!domain) return true;
  return BLOCKED_FREE_DOMAINS.some((d) => domain === d || domain.endsWith("." + d));
}

export function getBlockedDomainError(): string {
  return "Sign-up with free email providers (e.g. Gmail, Yahoo, Outlook) is not allowed. Please use your university or work email.";
}
