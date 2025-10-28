import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export interface AuthPayload {
  uid: string
  email: string
  role: 'admin' | 'viewer'
  displayName?: string
  exp?: number
}

export async function createToken(payload: Omit<AuthPayload, 'exp'>): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as AuthPayload
  } catch (error) {
    return null
  }
}

export async function setAuthCookie(payload: Omit<AuthPayload, 'exp'>) {
  const token = await createToken(payload)
  const cookieStore = await cookies()
  
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 heures
    path: '/'
  })
  
  return token
}

export async function getAuthFromCookie(): Promise<AuthPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')
  
  if (!token) return null
  
  return await verifyToken(token.value)
}

export async function removeAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}