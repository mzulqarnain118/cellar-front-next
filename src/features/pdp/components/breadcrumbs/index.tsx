import { Skeleton } from '@mantine/core'
import { Breadcrumbs as DaisyBreadcrumbs } from 'react-daisyui'

import { Link } from '@/components/link'
import { HOME_PAGE_PATH, WINE_PAGE_PATH } from '@/lib/paths'
import { useProductQuery } from '@/lib/queries/products'

interface BreadcrumbsProps {
  cartUrl: string
}

export const Breadcrumbs = ({ cartUrl }: BreadcrumbsProps) => {
  const { data: product, isFetching, isLoading } = useProductQuery(cartUrl)

  if (isFetching || isLoading) {
    return <Skeleton className="mb-2 h-6 py-2 lg:w-1/4" />
  }

  return (
    <DaisyBreadcrumbs>
      <DaisyBreadcrumbs.Item>
        <Link href={HOME_PAGE_PATH}>Home</Link>
      </DaisyBreadcrumbs.Item>
      <DaisyBreadcrumbs.Item>
        <Link href={WINE_PAGE_PATH}>Wine</Link>
      </DaisyBreadcrumbs.Item>
      <DaisyBreadcrumbs.Item>{product?.displayName}</DaisyBreadcrumbs.Item>
    </DaisyBreadcrumbs>
  )
}
