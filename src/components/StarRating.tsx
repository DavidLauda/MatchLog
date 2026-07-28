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
            className={`w-9 h-9 transition-all stroke-[2.5] ${
              star <= (hover || rating)
                ? 'fill-amber-400 text-black drop-shadow-[3px_3px_0px_#000] scale-110'
                : 'fill-white text-black drop-shadow-[2px_2px_0px_#000] hover:fill-amber-200'
            }`}
          />
        </button>
      ))}
      <input type="hidden" name="stars" value={rating} />
    </div>
  )
}
