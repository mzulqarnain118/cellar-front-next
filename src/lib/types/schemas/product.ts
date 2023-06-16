import { z } from 'zod'

const attributesSchema = z
  .object({
    'AutoSip Base SKU': z.string(),
    Brand: z.string(),
    'Container Size': z.string(),
    Origin: z.string(),
    'Pairing Notes': z.array(z.object({ imageUrl: z.string(), name: z.string() })),
    Structure: z.string(),
    SubType: z.string(),
    'Tasting Notes': z.array(z.object({ imageUrl: z.string(), name: z.string() })),
    Varietal: z.string(),
    Vintage: z.string(),
  })
  .partial()

export const schema = z.object({
  attributes: attributesSchema.optional(),
  availability: z
    .array(
      z.object({
        abbreviation: z.string(),
        enabled: z.boolean(),
        name: z.string(),
        provinceId: z.number(),
      })
    )
    .optional(),
  badges: z
    .array(
      z.object({
        imageUrl: z.string(),
        name: z.string(),
      })
    )
    .optional(),
  cartUrl: z.string().min(1, 'There must be a cartUrl.'),
  catalogId: z.number(),
  displayCategories: z.array(z.number()),
  displayCategoriesSortData: z.array(z.object({ id: z.number(), order: z.number() })).optional(),
  displayName: z.string(),
  isAutoSip: z.boolean(),
  isClubOnly: z.boolean(),
  isGift: z.boolean(),
  isGiftCard: z.boolean(),
  isScoutCircleClub: z.boolean(),
  isVip: z.boolean(),
  onSalePrice: z.number().optional(),
  pictureUrl: z.string().optional(),
  price: z.number(),
  quantityAvailable: z.number(),
  sku: z.string(),
  subscribable: z.boolean(),
  variations: z
    .array(
      z.object({
        active: z.boolean(),
        primary: z.boolean(),
        sku: z.string(),
        variations: z.array(z.object({ option: z.string(), type: z.string() })).optional(),
      })
    )
    .optional(),
})

const productSchema = schema.merge(z.object({ subscriptionProduct: schema.optional() }))

export type ProductsSchema = z.infer<typeof productSchema>

interface ProductsSuccess {
  data: ProductsSchema[]
  success: true
}

interface ProductSuccess {
  data: ProductsSchema
  success: true
}

interface Failure {
  error: {
    message: string
  }
  success: false
}

export type ProductsResponse = ProductsSuccess | Failure
export type ProductResponse = ProductSuccess | Failure

export const paginatedProductsSchema = z.object({
  nextPageUrl: z.string().optional(),
  page: z.number().positive(),
  perPage: z.number().positive(),
  previousPageUrl: z.string().optional(),
  products: z.array(schema),
  results: z.number().positive(),
  resultsShown: z.array(z.number()),
  totalNumberOfPages: z.number().positive(),
})

export type PaginatedProductsSchema = z.infer<typeof paginatedProductsSchema>

interface PaginatedProductsSuccess {
  data: PaginatedProductsSchema
  success: true
}

export type PaginatedProductsResponse = PaginatedProductsSuccess | Failure
