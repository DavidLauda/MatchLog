import * as fs from 'fs'
import * as path from 'path'

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
  console.log('User:', user)
}

main().catch(console.error)
