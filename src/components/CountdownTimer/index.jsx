import { useEffect, useState } from 'react'

import styles from './Timer.module.css'

const Timer = ({ endDate, startDate, slice }) => {
  const timeUnit = {
    'background-color': slice?.primary?.number_background_color ?? '#464c2c',
    color: slice?.primary?.number_color ?? 'white',
  }
  const colonColor = {
    color: slice?.primary?.number_background_color ?? '#464c2c',
  }
  const labelColor = { color: slice?.primary?.label_color ?? '#464c2c' }
  const calculateTimeLeft = () => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    const timeLeft = end - now

    if (timeLeft <= 0 || now < start) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
      }
    }

    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft / 1000 / 60) % 60)
    const seconds = Math.floor((timeLeft / 1000) % 60)

    return {
      hours,
      minutes,
      seconds,
    }
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  useEffect(() => {
    const now = new Date()
    if (now >= new Date(startDate) && now <= new Date(endDate)) {
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft())
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [startDate, endDate])

  return (
    <div className={styles.timer}>
      <div className={styles.timeUnitContainer}>
        <div className={styles.timeItem}>
          <div className={styles.timeUnit} style={timeUnit}>
            {Math.floor(timeLeft.hours / 10)}
          </div>
          <div className={styles.timeUnit} style={timeUnit}>
            {timeLeft.hours % 10}
          </div>
        </div>
        <div className={styles.label} style={labelColor}>
          HOURS
        </div>
      </div>
      <div className={styles.colon} style={colonColor}>
        :
      </div>
      <div className={styles.timeUnitContainer}>
        <div className={styles.timeItem}>
          <div className={styles.timeUnit} style={timeUnit}>
            {Math.floor(timeLeft.minutes / 10)}
          </div>
          <div className={styles.timeUnit} style={timeUnit}>
            {timeLeft.minutes % 10}
          </div>
        </div>
        <div className={styles.label} style={labelColor}>
          MINUTES
        </div>
      </div>
      <div className={styles.colon} style={colonColor}>
        :
      </div>
      <div className={styles.timeUnitContainer}>
        <div className={styles.timeItem}>
          <div className={styles.timeUnit} style={timeUnit}>
            {Math.floor(timeLeft.seconds / 10)}
          </div>
          <div className={styles.timeUnit} style={timeUnit}>
            {timeLeft.seconds % 10}
          </div>
        </div>
        <div className={styles.label} style={labelColor}>
          SECONDS
        </div>
      </div>
    </div>
  )
}

export default function Counter({ slice }) {
  const startDate = slice?.primary?.start_date_time
  const endDate = slice?.primary?.end_date_time

  return (
    <div className={styles.container}>
      <Timer endDate={endDate} slice={slice} startDate={startDate} />
    </div>
  )
}
