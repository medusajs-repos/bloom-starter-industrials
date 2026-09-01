import { PRODUCT_INDEX_NAME } from "@/lib/search-client"

const sortValue = (field: string, direction: "asc" | "desc") =>
  `${PRODUCT_INDEX_NAME}/sort/${field}:${direction}`

export const PRODUCT_SORT_OPTIONS = [
  { label: "Relevance", value: PRODUCT_INDEX_NAME },
  { label: "Newest", value: sortValue("created_at", "desc") },
  { label: "Name: A-Z", value: sortValue("title", "asc") },
  { label: "Name: Z-A", value: sortValue("title", "desc") },
  { label: "Price: Low to High", value: sortValue("min_price", "asc") },
  { label: "Price: High to Low", value: sortValue("min_price", "desc") },
]

export const PRICE_SORT_VALUES = [
  sortValue("min_price", "asc"),
  sortValue("min_price", "desc"),
]

export const PRODUCT_HITS_PER_PAGE = 24
