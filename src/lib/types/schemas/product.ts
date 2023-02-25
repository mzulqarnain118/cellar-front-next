import { z } from 'zod'

export const schema = z.object({
  attributes: z.record(z.string(), z.string()).optional(),
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
  displayCategories: z
    .array(
      z.object({
        id: z.number(),
        order: z.number(),
      })
    )
    .optional(),
  displayName: z.string(),
  onSalePrice: z.number().optional(),
  pictureUrl: z.string().optional(),
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

export type ProductsSchema = z.infer<typeof schema>

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
