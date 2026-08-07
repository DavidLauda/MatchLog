import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import prisma from './prisma'

const secretKey = process.env.JWT_SECRET || 'super-secret-key-for-local-dev-only'
const key = new TextEncoder().encode(secretKey)

export async function createToken(userId: string) {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(key)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    })
    return payload
  } catch (err) {
    return null
  }
}

export async function setSessionCookie(userId: string) {
  const token = await createToken(userId)
  const cookieStore = await cookies()
  cookieStore.set('matchlog_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('matchlog_session')
}

export async function getUserFromSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('matchlog_session')?.value
  
  if (!token) return null
  
  const payload = await verifyToken(token)
  if (!payload || !payload.userId) return null
  
  const user = await prisma.user.findUnique({
    where: { id: payload.userId as string }
  })
  
  return user
}
