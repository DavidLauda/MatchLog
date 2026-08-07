import * as fs from 'fs'
import * as path from 'path'
import { compare } from 'bcrypt'

const envPath = path.join(process.cwd(), '.env')
const envConfig = fs.readFileSync(envPath, 'utf8')
envConfig.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    process.env[match[1].trim()] = match[2].trim().replace(/^['"](.*)['"]$/, '$1')
  }
})

async function main() {
  const { default: prisma } = await import('../src/lib/prisma.js' as any)
  const user = await prisma.user.findUnique({ where: { username: 'demo_user' } })
  console.log('User found:', !!user)
  if (user && user.passwordHash) {
    const isValid = await compare('password123', user.passwordHash)
    console.log('Is valid:', isValid)
  }
}

main().catch(console.error)
