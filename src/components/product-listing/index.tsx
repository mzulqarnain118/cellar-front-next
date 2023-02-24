// import { useState } from 'react'

// import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
// import { clsx } from 'clsx'

// import { Pagination } from '@/core/components/pagination'
// import { usePaginatedProductsQuery } from '@/lib/queries/products'

// import { Filter } from './filter'
// import { FilterBar } from './filter/filter-bar'
// import { ProductCard } from './product-card'

// interface ProductListingProps {
//   categoryDisplayCategoryId?: number
// }

// export const ProductListing = ({ categoryDisplayCategoryId }: ProductListingProps) => {
//   const [limit, setLimit] = useState(12)
//   const [page, setPage] = useState(1)
//   const { isLoading, isError, error, data, isFetching, isPreviousData } = usePaginatedProductsQuery(
//     {
//       categoryDisplayCategoryId: categoryDisplayCategoryId || 0,
//       limit,
//       page,
//     }
//   )
//   const [showFilters, setShowFilters] = useState(false)

//   if (!data) {
//     return <></>
//   }

//   const onChange = (newPage: number) => {
//     setPage(newPage)

//     if (typeof window !== 'undefined') {
//       window.scrollTo({ behavior: 'smooth', top: 0 })
//     }
//   }

//   return (
//     <>
//       <div className="flex">
//         <div
//           className={clsx(
//             'w-0 space-y-4 overflow-hidden transition-[width] duration-150',
//             showFilters && 'mr-10 w-[36rem] overflow-auto'
//           )}
//         >
//           {['Origin', 'Tasting Notes', 'Pairing Notes', 'Brand'].map(filter => (
//             <Filter key={filter} name={filter} />
//           ))}
//         </div>
//         <div>
//           <FilterBar />
//           <div className="mb-4 flex w-full items-end justify-between">
//             <div className="grid gap-2">
//               <span className="text-neutral-400">100 results</span>
//               <button
//                 className="flex gap-1 rounded-lg border p-2"
//                 type="button"
//                 onClick={() => setShowFilters(prev => !prev)}
//               >
//                 <AdjustmentsHorizontalIcon className="h-6 w-6" />
//                 {showFilters ? 'Hide' : 'Show'} Filters
//               </button>
//             </div>
//             <div className="">
//               <label htmlFor="sort-by">Sort by: </label>
//               <select
//                 className={`
//                   form-select rounded-lg border-neutral-200 bg-neutral-50
//                   focus-visible:border-brand-500 focus-visible:outline-none
//                   focus-visible:ring-brand-500
//                 `}
//                 id="sort-by"
//               >
//                 <option>Relevance</option>
//                 <option>Newest</option>
//                 <option>Price: Low to High</option>
//                 <option>Price: High to Low</option>
//               </select>
//             </div>
//           </div>
//           <div className="grid auto-rows-auto grid-cols-4 gap-4">
//             {data.products.map((product, index) => (
//               <ProductCard key={product.sku} priority={index < 4} product={product} />
//             ))}
//           </div>
//           <Pagination
//             currentPage={page}
//             numberOfPages={data.totalNumberOfPages}
//             numberOfResults={data.totalNumberOfProducts}
//             resultsPerPage={limit}
//             onChange={onChange}
//           />
//         </div>
//       </div>
//     </>
//   )
// }
