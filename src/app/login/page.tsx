'use client'

import Link from 'next/link'
import { Trophy, AlertCircle } from 'lucide-react'
import { login } from '@/app/actions/auth'
import { useActionState } from 'react'

export default function LoginPage() {
  const [state, action, isPending] = useActionState(login, null)

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-md bg-white border-[3px] border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_#000]">
        <div className="flex justify-center mb-6">
          <div className="bg-[#a3e635] p-4 rounded-3xl border-[3px] border-black shadow-[4px_4px_0px_0px_#000]">
            <Trophy className="w-10 h-10 text-black stroke-[2.5]" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-center text-black mb-2">Welcome Back</h1>
        <p className="text-center text-zinc-600 font-bold mb-8">Log in to view your MatchLog diary.</p>

        {state?.error && (
          <div className="mb-6 bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded-2xl font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{state.error}</p>
          </div>
        )}

        <form action={action} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-black uppercase tracking-wider mb-2">Username</label>
            <input 
              type="text" 
              name="username" 
              required 
              className="w-full bg-white border-2 border-black rounded-2xl p-3 text-black font-bold focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[2px_2px_0px_0px_#000] shadow-[3px_3px_0px_0px_#000] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-black uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              name="password" 
              required 
              className="w-full bg-white border-2 border-black rounded-2xl p-3 text-black font-bold focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[2px_2px_0px_0px_#000] shadow-[3px_3px_0px_0px_#000] transition-all"
            />
          </div>
          
          <div className="pt-4">
            <button type="submit" disabled={isPending} className="w-full retro-btn-primary py-3 disabled:opacity-50">
              {isPending ? 'Logging in...' : 'Log In'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm font-bold text-zinc-600 mt-6">
          Don't have an account? <Link href="/signup" className="text-black font-black underline decoration-2 hover:text-[#ec4899]">Sign up here</Link>
        </p>
      </div>
    </div>
  )
}
