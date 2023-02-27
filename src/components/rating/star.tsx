import { useId } from 'react'

interface StarProps {
  active: boolean
}

export const Star = ({ active }: StarProps) => {
  const id = useId()

  return (
    <>
      <label className="invisible inline-block max-w-0" htmlFor={id}>
        Star {id}
      </label>
      <input
        readOnly
        checked={active}
        className="mask mask-star-2 bg-orange-400"
        id={id}
        name={id}
        type="radio"
      />
    </>
  )
}
