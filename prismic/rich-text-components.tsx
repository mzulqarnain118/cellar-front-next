import type { JSXMapSerializer } from '@prismicio/react'

import { Typography } from '@/core/components/typogrpahy'
import { parsePrismicRichText } from '@/lib/utils/prismic'

export const richTextComponents: JSXMapSerializer = {
  heading1: ({ children, key, text = '', node: { spans } }) => {
    const content = parsePrismicRichText(text, spans)

    return (
      <Typography key={key} as="h1">
        {content ? content : children}
      </Typography>
    )
  },
  heading2: ({ children, key, text = '', node: { spans } }) => {
    const content = parsePrismicRichText(text, spans)

    return (
      <Typography key={key} as="h2">
        {content ? content : children}
      </Typography>
    )
  },
  heading3: ({ children, key, text = '', node: { spans } }) => {
    const content = parsePrismicRichText(text, spans)

    return (
      <Typography key={key} as="h3">
        {content ? content : children}
      </Typography>
    )
  },
  heading4: ({ children, key, text = '', node: { spans } }) => {
    const content = parsePrismicRichText(text, spans)

    return (
      <Typography key={key} as="h4">
        {content ? content : children}
      </Typography>
    )
  },
  heading5: ({ children, key, text = '', node: { spans } }) => {
    const content = parsePrismicRichText(text, spans)

    return (
      <Typography key={key} as="h5">
        {content ? content : children}
      </Typography>
    )
  },
  heading6: ({ children, key, text = '', node: { spans } }) => {
    const content = parsePrismicRichText(text, spans)

    return (
      <Typography key={key} as="h6">
        {content ? content : children}
      </Typography>
    )
  },
  paragraph: ({ children, key, text = '', node: { spans } }) => {
    const content = parsePrismicRichText(text, spans)

    return (
      <Typography key={key} as="p">
        {content ? content : children}
      </Typography>
    )
  },
}
