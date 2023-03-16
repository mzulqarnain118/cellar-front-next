/* eslint-disable @typescript-eslint/no-explicit-any */
type Key = ((item: { [key: string]: any }) => string) | string

export const uniqueBy = <T extends { [key: string]: any }>(array: T[], key: Key): T[] => {
  if (typeof key !== 'function') {
    const property = key
    key = item => item[property]
  }
  return Array.from(
    array
      .reduce((map, item) => {
        if (typeof key !== 'string') {
          const k = key(item)

          if (!map.has(k)) {
            map.set(k, item)
          }
        }
        return map
      }, new Map())
      .values()
  )
}
