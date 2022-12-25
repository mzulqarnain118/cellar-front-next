import Image from 'next/image'

export const CompanyLogo = () => (
  <div className="relative h-12 w-44 lg:h-14 lg:w-60">
    <Image
      fill
      priority
      alt="Scout & Cellar Company Logo"
      sizes="(max-width: 640px) 11rem, (max-width: 1024px) 15rem"
      src="/logo.svg"
    />
  </div>
)
