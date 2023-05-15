import dynamic from 'next/dynamic'

import { CompanyLogo } from '@/components/company-logo'
import { Typography } from '@/core/components/typogrpahy'
import { HOME_PAGE_PATH } from '@/lib/paths'

const Link = dynamic(() => import('src/components/link').then(module => module.Link), {
  ssr: false,
})

export const Footer = () => (
  // ! TODO: Fetch data from Prismic
  <footer className="mt-auto w-full border-t-2 bg-neutral-dark py-6 text-14 text-base-dark">
    <div className="container mx-auto space-y-10">
      <div
        className={`
          flex flex-col items-center justify-center space-y-5 md:flex-row md:items-start
          md:justify-between md:space-y-0
      `}
      >
        <div className="md:w-full md:self-center">
          <CompanyLogo white />
        </div>
        <div className="flex w-full flex-col space-y-4">
          <Typography className="text-base font-bold text-base-light">Shop</Typography>
          <div className="space-y-2 [&>*]:block">
            <Link href="/">Wine</Link>
            <Link href="/">Wine Club</Link>
            <Link href="/">Coffee</Link>
            <Link href="/">Merch</Link>
            <Link href="/">About Clean-Crafted</Link>
            <Link href="/">Track Your Order</Link>
          </div>
        </div>
        <div className="flex w-full flex-col space-y-4">
          <Typography className="text-base font-bold text-base-light">Services</Typography>
          <div className="space-y-2 [&>*]:block">
            <Link href="/">FAQ</Link>
            <Link href="/">Find a Consultant</Link>
            <Link href="/">Become a Consultant</Link>
            <Link href="/">Log in as a Consultant</Link>
            <Link href="/">Winery Team Careers</Link>
            <Link href="/">Contact Us</Link>
          </div>
        </div>
        <div className="flex w-full flex-col space-y-4">
          <Typography className="text-base font-bold text-base-light">Legal</Typography>
          <div className="space-y-2 [&>*]:block">
            <Link href="/">Income Disclosure</Link>
            <Link href="/">Satisfaction Guarantee</Link>
            <Link href="/">Privacy Policy</Link>
            <Link href="/">Terms and Conditions</Link>
            <Link href="/">Press Inquires</Link>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-center">
        <div className="mb-3 flex space-x-4">
          <Link aria-label="Facebook" className="group" href={HOME_PAGE_PATH}>
            <svg height="24" viewBox="0 0 310 310" width="24">
              <path
                className="fill-brand group-hover:fill-brand-600 group-active:fill-brand-700 transition"
                d="m81.703 165.106h33.981v139.894c0 2.762 2.238 5 5 5h57.616c2.762 0 5-2.238 5-5v-139.235h39.064c2.54 0 4.677-1.906 4.967-4.429l5.933-51.502c.163-1.417-.286-2.836-1.234-3.899-.949-1.064-2.307-1.673-3.732-1.673h-44.996v-32.284c0-9.732 5.24-14.667 15.576-14.667h29.42c2.762 0 5-2.239 5-5v-47.274c0-2.762-2.238-5-5-5h-40.545c-.286-.014-.921-.037-1.857-.037-7.035 0-31.488 1.381-50.804 19.151-21.402 19.692-18.427 43.27-17.716 47.358v37.752h-35.673c-2.762 0-5 2.238-5 5v50.844c0 2.762 2.238 5.001 5 5.001z"
              />
            </svg>
          </Link>
          <Link aria-label="Instagram" className="group" href={HOME_PAGE_PATH}>
            <svg fill="none" height="24" viewBox="0 0 15 15" width="24">
              <path
                className="fill-brand group-hover:fill-brand-600 group-active:fill-brand-700 transition"
                d="M7.5 5C6.11929 5 5 6.11929 5 7.5C5 8.88071 6.11929 10 7.5 10C8.88071 10 10 8.88071 10 7.5C10 6.11929 8.88071 5 7.5 5Z"
              />
              <path
                className="fill-brand group-hover:fill-brand-600 group-active:fill-brand-700 transition"
                clipRule="evenodd"
                d="M4.5 0C2.01472 0 0 2.01472 0 4.5V10.5C0 12.9853 2.01472 15 4.5 15H10.5C12.9853 15 15 12.9853 15 10.5V4.5C15 2.01472 12.9853 0 10.5 0H4.5ZM4 7.5C4 5.567 5.567 4 7.5 4C9.433 4 11 5.567 11 7.5C11 9.433 9.433 11 7.5 11C5.567 11 4 9.433 4 7.5ZM11 4H12V3H11V4Z"
                fillRule="evenodd"
              />
            </svg>
          </Link>
          <Link aria-label="YouTube" className="group" href={HOME_PAGE_PATH}>
            <svg fill="none" height="24" viewBox="0 0 24 24" width="24">
              <path
                className="fill-brand group-hover:fill-brand-600 group-active:fill-brand-700 transition"
                clipRule="evenodd"
                d="M22.54 6.42a2.765 2.765 0 0 0-1.945-1.957C18.88 4 12 4 12 4s-6.88 0-8.595.463A2.765 2.765 0 0 0 1.46 6.42C1 8.148 1 11.75 1 11.75s0 3.602.46 5.33a2.765 2.765 0 0 0 1.945 1.958C5.121 19.5 12 19.5 12 19.5s6.88 0 8.595-.462a2.765 2.765 0 0 0 1.945-1.958c.46-1.726.46-5.33.46-5.33s0-3.602-.46-5.33ZM9.75 8.479v6.542l5.75-3.271-5.75-3.271Z"
                fillRule="evenodd"
              />
            </svg>
          </Link>
        </div>
        <Typography className="text-base text-sm">
          © {new Date().getFullYear()} Scout & Cellar | Clean-Crafted Commitment®
        </Typography>
        <address className="text-sm not-italic">
          4531 Simonton Road Farmers Branch, TX 75244
        </address>
      </div>
    </div>
  </footer>
)
