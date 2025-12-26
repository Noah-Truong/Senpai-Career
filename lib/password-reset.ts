import fs from "fs";
import path from "path";
import crypto from "crypto";

const RESET_TOKENS_FILE = path.join(process.cwd(), "data", "password-reset-tokens.json");

interface ResetToken {
  email: string;
  token: string;
  expiresAt: string; // ISO timestamp
  used: boolean;
}

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(RESET_TOKENS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(RESET_TOKENS_FILE)) {
    fs.writeFileSync(RESET_TOKENS_FILE, JSON.stringify([], null, 2));
  }
};

export const readResetTokens = (): ResetToken[] => {
  ensureDataDir();
  try {
    const data = fs.readFileSync(RESET_TOKENS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

export const saveResetTokens = (tokens: ResetToken[]) => {
  ensureDataDir();
  fs.writeFileSync(RESET_TOKENS_FILE, JSON.stringify(tokens, null, 2));
};

export const generateResetToken = (email: string): string => {
  // Generate a secure random token
  const token = crypto.randomBytes(32).toString("hex");
  
  // Expires in 1 hour
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  
  const tokens = readResetTokens();
  
  // Remove old tokens for this email
  const filteredTokens = tokens.filter(t => t.email !== email || new Date(t.expiresAt) < new Date());
  
  // Add new token
  filteredTokens.push({
    email,
    token,
    expiresAt,
    used: false,
  });
  
  saveResetTokens(filteredTokens);
  
  return token;
};

export const validateResetToken = (token: string): { valid: boolean; email?: string } => {
  const tokens = readResetTokens();
  const resetToken = tokens.find(
    t => t.token === token && 
    !t.used && 
    new Date(t.expiresAt) > new Date()
  );
  
  if (!resetToken) {
    return { valid: false };
  }
  
  return { valid: true, email: resetToken.email };
};

export const markTokenAsUsed = (token: string): void => {
  const tokens = readResetTokens();
  const tokenIndex = tokens.findIndex(t => t.token === token);
  
  if (tokenIndex !== -1) {
    tokens[tokenIndex].used = true;
    saveResetTokens(tokens);
  }
};

// Clean up expired tokens (call this periodically or on token validation)
export const cleanupExpiredTokens = (): void => {
  const tokens = readResetTokens();
  const now = new Date();
  const validTokens = tokens.filter(t => new Date(t.expiresAt) > now);
  saveResetTokens(validTokens);
};

