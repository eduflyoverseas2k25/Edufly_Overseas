import bcrypt from 'bcrypt';
import crypto from 'crypto';

const SALT_ROUNDS = 10;
const TOKEN_SECRET = process.env.SESSION_SECRET || "default-secret-change-me";
const TOKEN_EXPIRY_HOURS = 24;

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Token generation (keeping existing logic)
export function generateToken(): string {
  const payload = {
    id: crypto.randomBytes(8).toString('hex'),
    exp: Date.now() + (TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
  };
  const data = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(data).digest('hex');
  return Buffer.from(data).toString('base64') + '.' + signature;
}

export function verifyToken(token: string): boolean {
  try {
    const [dataB64, signature] = token.split('.');
    if (!dataB64 || !signature) return false;
    
    const data = Buffer.from(dataB64, 'base64').toString('utf8');
    const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(data).digest('hex');
    
    if (signature !== expectedSig) return false;
    
    const payload = JSON.parse(data);
    if (payload.exp < Date.now()) return false;
    
    return true;
  } catch {
    return false;
  }
}

// Initialize admin with hashed password
export async function initializeAdmin(): Promise<string> {
  const adminUser = process.env.ADMIN_USER || "admin";
  const adminPass = process.env.ADMIN_PASS || "Varshaa@1999";
  
  const hashedPassword = await hashPassword(adminPass);
  
  return hashedPassword;
}
