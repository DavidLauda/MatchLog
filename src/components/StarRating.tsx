'use client'

import { Star } from 'lucide-react'
import { useState } from 'react'

export function StarRating({ initialRating = 0 }: { initialRating?: number }) {
  const [rating, setRating] = useState(initialRating)
  const [hover, setHover] = useState(0)

  return (
    <div className="flex gap-1" id="star-rating-container" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const currentVal = hover || rating
        const isFull = currentVal >= star
        const isHalf = currentVal === star - 0.5

        return (
          <div
            key={star}
            className="relative w-9 h-9 transition-transform hover:scale-110"
          >
            {/* Background / Full Star */}
            <Star
              className={`w-9 h-9 transition-all stroke-[2.5] absolute inset-0 pointer-events-none ${
                isFull || isHalf
                  ? 'scale-110 drop-shadow-[3px_3px_0px_#000]'
                  : 'drop-shadow-[2px_2px_0px_#000]'
              } ${isFull ? 'fill-amber-400 text-black' : 'fill-white text-black hover:fill-amber-200'}`}
            />
            
            {/* Half Star Visual Layer */}
            {isHalf && (
              <Star
                className="w-9 h-9 absolute left-0 top-0 transition-all stroke-[2.5] fill-amber-400 text-black scale-110 drop-shadow-[3px_3px_0px_#000] z-10 pointer-events-none"
                style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}
              />
            )}
            
            {/* Interactive Overlay Layer */}
            <div className="absolute inset-0 flex z-20">
              <button
                type="button"
                className="w-1/2 h-full cursor-pointer focus:outline-none"
                onClick={() => setRating(star - 0.5)}
                onMouseEnter={() => setHover(star - 0.5)}
                aria-label={`${star - 0.5} stars`}
              />
              <button
                type="button"
                className="w-1/2 h-full cursor-pointer focus:outline-none"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                aria-label={`${star} stars`}
              />
            </div>
          </div>
        )
      })}
      <input type="hidden" name="stars" id="stars-input" value={rating} />
    </div>
  )
}
