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
        className="p-2 text-red-600 hover:bg-red-100 rounded-xl border-2 border-transparent hover:border-black transition-all cursor-pointer disabled:opacity-50"
        title="Delete list"
      >
        <Trash2 className="w-4 h-4 stroke-[2.5]" />
      </button>
    )
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#fda4af] hover:bg-[#fb7185] text-black border-2 border-black text-sm font-black transition-all cursor-pointer shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-50 shrink-0"
    >
      <Trash2 className="w-4 h-4 stroke-[2.5]" />
      {isPending ? 'Deleting...' : 'Delete List'}
    </button>
  )
}
