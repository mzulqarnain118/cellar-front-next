import dynamic from 'next/dynamic'

const Link = dynamic(() => import('src/components/link').then(module => module.Link), {
  ssr: false,
})

export const SkipLink = () => (
  <Link
    className="absolute right-full top-0 z-50 border-2 border-white p-4 text-white focus:right-auto focus:bg-black"
    href="/#main"
  >
    Skip to content
  </Link>
)
