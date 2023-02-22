import * as prismicT from '@prismicio/types'
import { clsx } from 'clsx'
import parse, { domToReact, Element, HTMLReactParserOptions } from 'html-react-parser'

const importantClasses = [
  'font-body',
  'font-bold',
  'font-heading',
  'font-semibold',
  'italic',
  'text-xs',
  'text-sm',
  'text-base',
  'text-lg',
  'text-neutral-50',
  'text-xl',
]

const options: HTMLReactParserOptions = {
  replace: domNode => {
    if (domNode instanceof Element && domNode.attribs) {
      const { children, name: htmlTagName } = domNode
      const isImportant = importantClasses.includes(htmlTagName)
      const Element = !isImportant ? (htmlTagName as keyof JSX.IntrinsicElements) : 'span'
      const attributes = domNode.attribs
      const className = Object.getOwnPropertyDescriptor(attributes, 'class')

      if (className) {
        Object.defineProperty(attributes, 'className', className)
        delete attributes.class
      }

      return (
        <Element
          {...attributes}
          className={clsx(
            !isImportant ? htmlTagName : `!${htmlTagName} ${htmlTagName}`,
            attributes.className
          )}
        >
          {domToReact(children, options)}
        </Element>
      )
    }
  },
}

const isElement = (
  element: prismicT.RTAnyNode
): element is
  | prismicT.RTStrongNode
  | prismicT.RTEmNode
  | prismicT.RTLabelNode
  | prismicT.RTLinkNode => 'start' in element

const recalculateElementPositions = (
  elements: prismicT.RTAnyNode[],
  delta: number,
  startIndexBeforeRecalculate: number
): prismicT.RTAnyNode[] =>
  elements.reduce<prismicT.RTAnyNode[]>((accumulator, currentElement) => {
    if (isElement(currentElement)) {
      const start =
        startIndexBeforeRecalculate === currentElement.start
          ? currentElement.start
          : currentElement.start + delta
      accumulator.push({
        ...currentElement,
        end: currentElement.end + delta,
        start,
      })
    }
    return accumulator
  }, [])

export const parsePrismicRichText = (htmlText: string, existingTags?: prismicT.RTAnyNode[]) => {
  let tagPositions = existingTags
  const newHtmlText = existingTags?.reduce((currentHtmlText, _currentTag, index) => {
    if (tagPositions !== undefined) {
      const actualTag = tagPositions[index]

      if (isElement(actualTag)) {
        const isHyperlink = actualTag.type === 'hyperlink'
        const webHyperlinkTarget =
          (!!isHyperlink && actualTag.data.link_type === 'Web' && actualTag.data.target) ||
          undefined

        const element = currentHtmlText.slice(actualTag.start, actualTag.end)
        const type = isHyperlink ? 'a' : actualTag.type
        const wrappedElement = `<${type}${
          isHyperlink
            ? ` href="${actualTag.data.url}" target="${webHyperlinkTarget || '_self'}"`
            : ''
        }>${element}</${type}>`

        tagPositions = [
          ...tagPositions.slice(0, index + 1),
          ...recalculateElementPositions(
            tagPositions.slice(index + 1),
            wrappedElement.length - element.length,
            actualTag.start
          ),
        ]
        const everythingBefore = currentHtmlText.slice(0, actualTag.start)
        const everythingAfter = currentHtmlText.slice(actualTag.end)

        return everythingBefore + wrappedElement + everythingAfter
      }
    }

    return currentHtmlText
  }, htmlText)

  // Wrap ^^ in a span with a highlight.
  let counter = 0
  let updatedString = newHtmlText || htmlText
  let targetIndex = updatedString.indexOf('^^')

  while (targetIndex !== -1) {
    const newStr = counter % 2 === 0 ? `<span class="highlight">` : '</span>'
    const firstSub = updatedString.substring(0, targetIndex)
    const secondSub = updatedString.substring(targetIndex).replace('^^', newStr)

    updatedString = firstSub + secondSub
    targetIndex = updatedString.indexOf('^^')
    counter++
  }

  return parse(updatedString, options)
}
