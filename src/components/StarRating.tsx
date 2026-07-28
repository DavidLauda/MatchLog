'use client'

import { Star } from 'lucide-react'
import { useState } from 'react'

export function StarRating({ initialRating = 0 }: { initialRating?: number }) {
  const [rating, setRating] = useState(initialRating)
  const [hover, setHover] = useState(0)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              star <= (hover || rating)
                ? 'fill-indigo-500 text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]'
                : 'text-slate-700'
            }`}
          />
        </button>
      ))}
      <input type="hidden" name="stars" value={rating} />
    </div>
  )
}
