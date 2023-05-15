import { exitPreview } from '@prismicio/next'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await exitPreview({ req, res })
}

export default handler
