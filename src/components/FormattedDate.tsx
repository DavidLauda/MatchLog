'use client'

import { useState, useEffect } from 'react'

interface FormattedDateProps {
  date: string | Date | number;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
  fallbackFormat?: 'iso' | 'short';
}

export function FormattedDate({ date, options, className, fallbackFormat = 'iso' }: FormattedDateProps) {
  const [formatted, setFormatted] = useState<string>('')

  useEffect(() => {
    if (!date) return
    try {
      const d = new Date(date)
      if (!isNaN(d.getTime())) {
        setFormatted(d.toLocaleDateString(undefined, options))
      }
    } catch (e) {
      setFormatted('')
    }
  }, [date, options])

  if (!formatted) {
    let fallbackStr = ''
    try {
      const d = new Date(date)
      if (!isNaN(d.getTime())) {
        if (fallbackFormat === 'short') {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          fallbackStr = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
        } else {
          fallbackStr = d.toISOString().split('T')[0]
        }
      }
    } catch (e) {
      fallbackStr = ''
    }
    return <span className={className}>{fallbackStr}</span>
  }

  return <span className={className}>{formatted}</span>
}
