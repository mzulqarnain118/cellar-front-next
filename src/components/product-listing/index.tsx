import { Product } from '@/lib/types'

import { Filter } from './filter'
import { FilterBar } from './filter-bar'
import { ProductCard } from './product-card'

interface ProductListingProps {
  products: Product[]
}

export const ProductListing = ({ products }: ProductListingProps) => (
  <div className="flex flex-col gap-12">
    <div className="flex w-full gap-10">
      <div className="flex w-1/5 flex-col">
        <span className="mb-2 text-2xl font-bold">Wine</span>
        <span className="mb-2">Filters</span>
        <div className="space-y-4">
          {['Origin', 'Tasting Notes', 'Pairing Notes', 'Brand'].map(filter => (
            <Filter key={filter} name={filter} />
          ))}
        </div>
      </div>
      <div className="w-4/5">
        <FilterBar />
        <div className="mb-4 flex w-full items-center justify-between">
          <span className="text-neutral-400">100 results</span>
          <div className="">
            <label htmlFor="sort-by">Sort by: </label>
            <select
              className={`
              form-select rounded-lg border-neutral-200 bg-neutral-50
              focus:border-primary-400 focus:outline-none focus:ring-primary-400
            `}
              id="sort-by"
            >
              <option>Relevance</option>
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>
        <div className="grid auto-rows-auto grid-cols-4 gap-4">
          {products.map((product, index) => (
            <ProductCard key={product.sku} priority={index < 4} product={product} />
          ))}
        </div>
      </div>
    </div>
  </div>
)
