const camelizePascal = (value: string) =>
  value
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, '')

const camelizeSnake = (value: string) => value.replace(/_([a-z])/g, (_, p1) => p1.toUpperCase())

type CamelizeString<ObjectProperty extends string> = ObjectProperty extends `${infer F}_${infer R}`
  ? `${F}${Capitalize<CamelizeString<R>>}`
  : ObjectProperty

export type Camelize<GenericObject> = {
  [ObjectProperty in keyof GenericObject as CamelizeString<
    ObjectProperty & string
  >]: GenericObject[ObjectProperty] extends Array<infer ArrayItem>
    ? ArrayItem extends Record<string, unknown>
      ? Array<Camelize<ArrayItem>>
      : GenericObject[ObjectProperty]
    : GenericObject[ObjectProperty] extends Record<string, unknown>
    ? Camelize<GenericObject[ObjectProperty]>
    : GenericObject[ObjectProperty]
}

export const camelizeSnakeKeys = <T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: any
): Camelize<T> => {
  if (Array.isArray(obj)) {
    return obj.map(v => camelizeSnakeKeys(v)) as Camelize<T>
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) =>
        key === 'slice_type'
          ? { ...result, slice_type: obj[key] }
          : {
              ...result,
              [camelizeSnake(key)]: camelizeSnakeKeys(obj[key]),
            },
      {}
    ) as Camelize<T>
  }
  return obj
}

export const camelizePascalKeys = <T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: any
): Camelize<T> => {
  if (Array.isArray(obj)) {
    return obj.map(v => camelizePascalKeys(v)) as Camelize<T>
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [camelizePascal(key)]: camelizePascalKeys(obj[key]),
      }),
      {}
    ) as Camelize<T>
  }
  return obj
}

export const formatCurrency = (amount: number) =>
  `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(
    amount
  )}`

interface UniqueId {
  field: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
}

/**
 * Replace item at given index.
 * @param array Array with data
 * @param index Index of item to replace
 * @param newValue New value to place at index
 * @return Modified array
 */
export const replaceItemAtIndex = <T>(array: T[], index: number, newValue: T) => [
  ...array.slice(0, index),
  newValue,
  ...array.slice(index + 1),
]

/**
 * Get item index by unique identifier.
 * @param array Array of data
 * @param uniqueId Unique identifier
 * @return Item
 */
export const getItemIndexByUniqueId = <T>(
  array: T[],
  uniqueId: UniqueId
  // @ts-ignore
) => array.map(item => item[uniqueId.field]).indexOf(uniqueId.value)

/**
 * Replace item by the given unique identifier.
 * @param array Array of data
 * @param uniqueId Unique identifier
 * @param item New item
 * @return Modified array
 */
export const replaceItemByUniqueId = <T>(array: T[], uniqueId: UniqueId, item: T) =>
  replaceItemAtIndex(array, getItemIndexByUniqueId(array, uniqueId), item)

export const debounce = <Params extends unknown[]>(
  func: (...args: Params) => unknown,
  timeout: number
): ((...args: Params) => void) => {
  let timer: NodeJS.Timeout
  return (...args: Params) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func(...args)
    }, timeout)
  }
}
