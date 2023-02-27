import { useId } from 'react'

import { clsx } from 'clsx'

import { Star } from './star'

interface RatingProps {
  className?: string
  rating?: number
}

export const Rating = ({ className, rating }: RatingProps) => {
  const id = useId()

  return (
    <div className={clsx('rating rating-md', className)}>
      <form id={id}>
        <Star active={rating === 1} />
        <Star active={rating === 2} />
        <Star active={rating === 3} />
        <Star active={rating === 4} />
        <Star active={rating === 5} />
      </form>
    </div>
  )
}
