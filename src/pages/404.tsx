import { useRouter } from 'next/router'

import { GetStaticProps, GetStaticPropsContext } from 'next'

import { useConsultantQuery } from '@/lib/queries/consultant'

export const getStaticProps: GetStaticProps = async ({ params: _ }: GetStaticPropsContext) => ({
  props: {},
})

const NotFoundPage = () => {
  const router = useRouter()
  const { data: _consultant, isLoading } = useConsultantQuery(router.asPath.substring(1))

  if (isLoading) {
    return <></>
  }

  return (
    <div className="container mx-auto">
      <h1>Not found</h1>
    </div>
  )
}

export default NotFoundPage
