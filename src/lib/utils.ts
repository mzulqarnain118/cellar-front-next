const toCamelCase = (value: string) =>
  value
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, '')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const camelizeKeys = <T>(obj: any): T => {
  if (Array.isArray(obj)) {
    return obj.map(v => camelizeKeys(v)) as T
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [toCamelCase(key)]: camelizeKeys(obj[key]),
      }),
      {}
    ) as T
  }
  return obj
}
