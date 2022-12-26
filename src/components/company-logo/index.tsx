import Image from 'next/image'

interface CompanyLogoProps {
  white?: boolean
}

export const CompanyLogo = ({ white = false }: CompanyLogoProps) => (
  <div className="relative h-12 w-44 lg:h-14 lg:w-60">
    <Image
      fill
      priority
      alt="Scout & Cellar Company Logo"
      sizes="(max-width: 640px) 11rem, (max-width: 1024px) 15rem"
      src={white ? '/white-logo.svg' : '/logo.svg'}
    />
  </div>
)
