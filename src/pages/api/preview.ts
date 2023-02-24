import type { NextApiRequest, NextApiResponse } from 'next'

import { redirectToPreviewURL, setPreviewData } from '@prismicio/next'

import { createClient } from 'prismic-io'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const client = createClient({ req })

  await setPreviewData({ req, res })
  await redirectToPreviewURL({ client, req, res })
}

export default handler
