import * as fs from 'fs'
import * as path from 'path'
import { hash } from 'bcrypt'

// Manually parse .env because tsx doesn't load it by default
const envPath = path.join(process.cwd(), '.env')
const envConfig = fs.readFileSync(envPath, 'utf8')
envConfig.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    process.env[match[1].trim()] = match[2].trim().replace(/^['"](.*)['"]$/, '$1')
  }
})

// Dynamically import prisma so it uses the env vars
async function main() {
  const { default: prisma } = await import('../src/lib/prisma.js' as any)
  const user = await prisma.user.findUnique({ where: { username: 'demo_user' } })
  if (user) {
    const passwordHash = await hash('password123', 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    })
    console.log('Password set for demo_user: password123')
  } else {
    console.log('demo_user not found')
  }
}

main().catch(console.error)
