export type Updater<T> = (previous: T) => T
export type Setter<T> = (value: T | Updater<T>) => void
