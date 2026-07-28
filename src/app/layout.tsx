import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { Trophy, Search, User } from 'lucide-react'
import { getFollowedEntities } from '@/app/actions'
import { NavFollowHub } from '@/components/NavFollowHub'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MatchLog',
  description: 'Log and rate your football matches',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const followedEntities = await getFollowedEntities()
  const initialFollows = followedEntities.map(f => ({ externalId: f.externalId, type: f.type }))

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen selection:bg-lime-300 selection:text-black`}>
        {/* Full-width Top Nav */}
        <header className="sticky top-0 z-50 w-full bg-[#fffef9]/95 backdrop-blur-md border-b-[3px] border-black shadow-[0_4px_0px_0px_#000]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-18 py-2">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="bg-[#a3e635] p-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[1px_1px_0px_0px_#000] transition-all">
                  <Trophy className="w-5 h-5 text-black stroke-[2.5]" />
                </div>
                <span className="font-black text-2xl tracking-tight text-black flex items-center gap-1">
                  MatchLog
                  <span className="text-[10px] bg-[#fde047] text-black px-1.5 py-0.5 rounded-md border border-black font-black uppercase tracking-wider">RETRO</span>
                </span>
              </Link>
              
              {/* Actions */}
              <nav className="flex items-center gap-3 sm:gap-4">
                <NavFollowHub initialFollows={initialFollows} />
                <Link 
                  href="/lists" 
                  className="text-sm font-black text-zinc-800 hover:text-black hover:underline decoration-2 underline-offset-4 transition-all hidden sm:block"
                >
                  Lists
                </Link>
                <Link 
                  href="/profile" 
                  className="flex items-center gap-1.5 text-sm font-black text-zinc-800 hover:text-black hover:underline decoration-2 underline-offset-4 transition-all hidden sm:flex"
                >
                  <User className="w-4 h-4 text-black stroke-[2.5]" />
                  <span>Profile</span>
                </Link>
                <Link 
                  href="/search" 
                  className="flex items-center gap-2 bg-[#18181b] hover:bg-zinc-800 text-white font-black border-2 border-black rounded-2xl px-4 py-2 shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000] transition-all text-sm"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span className="hidden sm:inline">Log Match</span>
                  <span className="sm:hidden">Log</span>
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {children}
        </main>
      </body>
    </html>
  )
}
