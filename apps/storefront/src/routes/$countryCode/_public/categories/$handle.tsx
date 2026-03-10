import { createFileRoute, notFound } from "@tanstack/react-router"
import { retrieveCategory } from "@/lib/data/categories"
import { getRegion } from "@/lib/data/regions"
import Category from "@/pages/category"
import { HttpTypes } from "@medusajs/types"

export const Route = createFileRoute("/$countryCode/_public/categories/$handle")({
  loader: async ({ params, context }) => {
    const { countryCode, handle } = params
    const { queryClient } = context

    const region = await queryClient.ensureQueryData({
      queryKey: ["region", countryCode],
      queryFn: () => getRegion({ country_code: countryCode }),
    })

    if (!region || !handle) {
      throw notFound()
    }

    const category = await queryClient.ensureQueryData({
      queryKey: ["category", handle],
      queryFn: async () => {
        try {
          return await retrieveCategory({ handle })
        } catch {
          throw notFound()
        }
      },
    })

    return {
      countryCode,
      region,
      category: category as HttpTypes.StoreProductCategory,
    }
  },
  head: ({ loaderData }) => {
    const { region, countryCode, category } = loaderData || {}
    const regionName = region?.name || countryCode?.toUpperCase()
    const categoryName = category?.name || "Category"
    const title = `${categoryName} - ${regionName} | ProLift Equipment`
    const description = `Shop ProLift's ${categoryName.toLowerCase()} category available in ${regionName}.`

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "twitter:card", content: "summary_large_image" },
        { property: "twitter:title", content: title },
        { property: "twitter:description", content: description },
      ]
    }
  },
  component: Category,
})
