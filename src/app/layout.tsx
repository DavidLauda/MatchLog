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
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-zinc-950 text-zinc-300 selection:bg-indigo-500/30`}>
        {/* Full-width Top Nav */}
        <header className="sticky top-0 z-50 w-full bg-zinc-950/90 backdrop-blur-lg border-b border-zinc-800 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <span className="font-extrabold text-xl tracking-tight text-zinc-100 group-hover:text-white transition-colors">MatchLog</span>
              </Link>
              
              {/* Actions */}
              <nav className="flex items-center gap-3 sm:gap-4">
                <NavFollowHub initialFollows={initialFollows} />
                <Link 
                  href="/lists" 
                  className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors hidden sm:block"
                >
                  Lists
                </Link>
                <Link 
                  href="/profile" 
                  className="flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors hidden sm:flex"
                >
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>Profile</span>
                </Link>
                <Link 
                  href="/search" 
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white transition-colors px-4 py-2 rounded-lg font-semibold text-sm shadow-md shadow-indigo-900/20"
                >
                  <Search className="w-4 h-4" />
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
