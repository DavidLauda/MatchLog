'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteList } from '@/app/actions'

interface DeleteListButtonProps {
  listId: string;
  listTitle: string;
  redirectAfterDelete?: boolean;
  variant?: 'header' | 'icon';
}

export function DeleteListButton({ 
  listId, 
  listTitle, 
  redirectAfterDelete = false, 
  variant = 'header' 
}: DeleteListButtonProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm(`Are you sure you want to delete the list "${listTitle}"? This action cannot be undone.`)) {
      startTransition(async () => {
        try {
          await deleteList(listId)
          if (redirectAfterDelete) {
            router.push('/lists')
            router.refresh()
          } else {
            router.refresh()
          }
        } catch (err) {
          console.error(err)
          alert('Failed to delete list.')
        }
      })
    }
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        title="Delete list"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    )
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow-rose-500/10 disabled:opacity-50 shrink-0"
    >
      <Trash2 className="w-4 h-4" />
      {isPending ? 'Deleting...' : 'Delete List'}
    </button>
  )
}
