import type { Content } from '@prismicio/client'
import { SliceComponentProps } from '@prismicio/react'

import CodeSnippetComponent from '../CodeSnippet'

type CodeSnippetProps =
  SliceComponentProps<Content.RichContentPageDocumentDataBodyColumnedContentSlice>

export const CodeSnippet = ({ slice }: CodeSnippetProps) => <CodeSnippetComponent slice={slice} />
