'use server'

import prisma from '@/lib/prisma'
import { hash, compare } from 'bcrypt'
import { setSessionCookie, clearSessionCookie } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function signup(prevState: any, formData: FormData) {
  const username = (formData.get('username') as string)?.trim()
  const password = formData.get('password') as string

  if (!username || !password || password.length < 6) {
    return { error: 'Invalid username or password (must be at least 6 characters)' }
  }

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) {
    return { error: 'Username already taken' }
  }

  const passwordHash = await hash(password, 10)
  
  const user = await prisma.user.create({
    data: {
      username,
      passwordHash,
    }
  })

  await setSessionCookie(user.id)
  redirect('/')
}

export async function login(prevState: any, formData: FormData) {
  const username = (formData.get('username') as string)?.trim()
  const password = formData.get('password') as string

  if (!username || !password) {
    return { error: 'Missing username or password' }
  }

  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) {
    return { error: `Debug: User not found for "${username}"` }
  }
  if (!user.passwordHash) {
    return { error: `Debug: User has no password set` }
  }

  let isValid = false
  try {
    isValid = await compare(password, user.passwordHash)
  } catch (err: any) {
    return { error: `Debug Bcrypt error: ${err.message}` }
  }

  if (!isValid) {
    return { error: `Debug: Password mismatch. Typed: "${password}"` }
  }

  await setSessionCookie(user.id)
  redirect('/')
}

export async function logout() {
  await clearSessionCookie()
  redirect('/login')
}
