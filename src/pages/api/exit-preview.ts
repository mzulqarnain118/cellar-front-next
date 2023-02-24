import type { NextApiRequest, NextApiResponse } from 'next'

import { exitPreview } from '@prismicio/next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await exitPreview({ req, res })
}

export default handler
