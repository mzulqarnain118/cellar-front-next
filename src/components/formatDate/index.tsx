/* eslint-disable sort-keys */
interface FormatDateProps {
  dateString: string | null
}

const FormatDate = ({ dateString }: FormatDateProps) => {
  const date = new Date(dateString)

  const formattedDate = date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  })

  return <>{formattedDate}</>
}

export default FormatDate
