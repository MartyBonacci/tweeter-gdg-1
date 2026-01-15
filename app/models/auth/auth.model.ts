import { eq } from 'drizzle-orm';
import { SignJWT } from 'jose';
import db from '~/lib/db/connection';
import { profiles } from '~/lib/db/schema';
import { hashPassword, verifyPassword } from './password';
import { signupSchema, loginSchema, type SignupData, type LoginData } from './auth.schema';

/**
 * Sign up a new user
 * @param data - User registration data
 * @returns User ID and verification token
 */
export async function signupUser(data: SignupData): Promise<{ userId: string; verificationToken: string }> {
  // Validate input
  const validated = signupSchema.parse(data);

  // Check if username already exists
  const existingUsername = await db.query.profiles.findFirst({
    where: eq(profiles.username, validated.username),
  });

  if (existingUsername) {
    throw new Error('Username already taken');
  }

  // Check if email already exists
  const existingEmail = await db.query.profiles.findFirst({
    where: eq(profiles.email, validated.email),
  });

  if (existingEmail) {
    throw new Error('Email already registered');
  }

  // Hash password
  const passwordHash = await hashPassword(validated.password);

  // Insert new user
  const [user] = await db
    .insert(profiles)
    .values({
      username: validated.username,
      email: validated.email,
      passwordHash,
      emailVerified: false,
    })
    .returning();

  // Generate verification token (JWT, 24hr expiry)
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const verificationToken = await new SignJWT({ userId: user.id, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(secret);

  return {
    userId: user.id,
    verificationToken,
  };
}

/**
 * Verify user email with token
 * @param token - JWT verification token
 */
export async function verifyEmail(token: string): Promise<void> {
  try {
    // Verify and decode JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { jwtVerify } = await import('jose');
    const { payload } = await jwtVerify(token, secret);

    if (!payload.userId || typeof payload.userId !== 'string') {
      throw new Error('Invalid token payload');
    }

    // Mark user as verified
    await db
      .update(profiles)
      .set({ emailVerified: true })
      .where(eq(profiles.id, payload.userId));
  } catch (error) {
    throw new Error('Invalid or expired verification token');
  }
}

/**
 * Authenticate user with email and password
 * @param email - User email
 * @param password - User password
 * @returns User object if authenticated, null otherwise
 */
export async function authenticateUser(email: string, password: string): Promise<typeof profiles.$inferSelect | null> {
  // Validate input
  const validated = loginSchema.parse({ email, password });

  // Find user by email
  const user = await db.query.profiles.findFirst({
    where: eq(profiles.email, validated.email),
  });

  if (!user) {
    return null;
  }

  // Verify password
  const isValid = await verifyPassword(user.passwordHash, validated.password);

  if (!isValid) {
    return null;
  }

  // Check if email is verified
  if (!user.emailVerified) {
    throw new Error('Email not verified. Please check your email for verification link.');
  }

  return user;
}
