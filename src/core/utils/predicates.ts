/**
 * Predicate that determines if a `JSX.Element` is truthy.
 * @param element The element in question.
 * @returns True if the given element is truthy.
 */
export const isTruthyJSXElement = (element: JSX.Element | undefined): element is JSX.Element =>
  !!element
