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

export const camelizeKeys = <T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: any
): Camelize<T> => {
  if (Array.isArray(obj)) {
    return obj.map(v => camelizeKeys(v)) as Camelize<T>
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) =>
        key === 'slice_type'
          ? { ...result, slice_type: obj[key] }
          : {
              ...result,
              [camelizeSnake(key)]: camelizeKeys(obj[key]),
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
