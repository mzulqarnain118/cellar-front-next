// interface PaginationProps {
//   currentPage?: number
//   resultsPerPage?: number
//   numberOfPages?: number
//   numberOfResults: number
//   onChange?: (page: number) => void
// }

export const Pagination = () => <>Hi</>
//   const pageCount = useMemo(() => {
//     let pages = numberOfPages
//     if (!pages) {
//       pages = Math.floor(numberOfResults / resultsPerPage)
//     }
//     return pages
//   }, [resultsPerPage, numberOfPages, numberOfResults])

//   const activePage = useMemo(
//     () => (currentPage >= pageCount ? pageCount : currentPage),
//     [currentPage, numberOfPages, pageCount]
//   )

//   const pageNavigation = useMemo(() => {
//     const distanceFromLastPage = pageCount - activePage
//   }, [activePage, pageCount])

//   const { firstResult, lastResult } = useMemo(() => {
//     const endPoint = resultsPerPage * activePage
//     const firstResult = activePage === 1 ? 1 : endPoint - resultsPerPage + 1
//     const lastResult = endPoint >= numberOfResults ? numberOfResults : endPoint

//     return { firstResult, lastResult }
//   }, [activePage, resultsPerPage])

//   return (
//     <>
//       <div className="flex items-center justify-between rounded-b border-t border-neutral-300 bg-white px-4 py-3 sm:px-6">
//         <div className="flex flex-1 justify-between sm:hidden">
//           <button
//             className="relative inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
//             onClick={() => {
//               if (onChange && currentPage > 1) {
//                 onChange(currentPage - 1)
//               }
//             }}
//           >
//             Previous
//           </button>
//           <button
//             className="relative ml-3 inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
//             onClick={() => {
//               if (onChange && currentPage !== numberOfPages) {
//                 onChange(currentPage + 1)
//               }
//             }}
//           >
//             Next
//           </button>
//         </div>
//         <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
//           <div>
//             <p className="text-sm text-neutral-700">
//               Showing <span className="font-medium">{firstResult}</span> to{' '}
//               <span className="font-medium">{lastResult}</span> of{' '}
//               <span className="font-medium">{numberOfResults}</span> results
//             </p>
//           </div>
//           <div>
//             <nav
//               aria-label="Pagination"
//               className="isolate inline-flex -space-x-px rounded-md shadow-sm"
//             >
//               <button
//                 className="relative inline-flex items-center rounded-l-md border border-neutral-300 bg-white px-2 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:z-20"
//                 onClick={() => {
//                   if (onChange && currentPage > 1) {
//                     onChange(currentPage - 1)
//                   }
//                 }}
//               >
//                 <span className="sr-only">Previous</span>
//                 <ChevronLeftIcon aria-hidden="true" className="h-5 w-5" />
//               </button>
//               <button
//                 aria-current="page"
//                 className="relative z-10 inline-flex items-center border border-brand-500 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-600 focus:z-20"
//               >
//                 1
//               </button>
//               <button
//                 className="relative inline-flex items-center border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:z-20"
//                 onClick={() => {
//                   if (onChange) {
//                     onChange(2)
//                   }
//                 }}
//               >
//                 2
//               </button>
//               <button
//                 className="relative hidden items-center border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:z-20 md:inline-flex"
//                 onClick={() => {
//                   if (onChange) {
//                     onChange(3)
//                   }
//                 }}
//               >
//                 3
//               </button>
//               <span className="relative inline-flex items-center border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700">
//                 ...
//               </span>
//               <button
//                 className="relative hidden items-center border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:z-20 md:inline-flex"
//                 onClick={() => {
//                   if (onChange) {
//                     onChange(8)
//                   }
//                 }}
//               >
//                 8
//               </button>
//               <button
//                 className="relative inline-flex items-center border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:z-20"
//                 onClick={() => {
//                   if (onChange) {
//                     onChange(9)
//                   }
//                 }}
//               >
//                 9
//               </button>
//               <button
//                 className="relative inline-flex items-center border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:z-20"
//                 onClick={() => {
//                   if (onChange) {
//                     onChange(10)
//                   }
//                 }}
//               >
//                 10
//               </button>
//               <button
//                 className="relative inline-flex items-center rounded-r-md border border-neutral-300 bg-white px-2 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:z-20"
//                 onClick={() => {
//                   if (onChange && currentPage !== numberOfPages) {
//                     onChange(currentPage + 1)
//                   }
//                 }}
//               >
//                 <span className="sr-only">Next</span>
//                 <ChevronRightIcon aria-hidden="true" className="h-5 w-5" />
//               </button>
//             </nav>
//           </div>
//         </div>
//       </div>
//     </>
//   )
// }
