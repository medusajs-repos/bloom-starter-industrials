import { useAuth } from "@/lib/hooks/use-auth"
import {
  PRICE_SORT_VALUES,
  PRODUCT_SORT_OPTIONS,
} from "@/lib/search-sort"
import { PRODUCT_INDEX_NAME } from "@/lib/search-client"
import { useEffect, useMemo } from "react"
import { useSortBy } from "react-instantsearch"

type SortSelectProps = {
  className?: string
}

export const SortSelect = ({ className = "" }: SortSelectProps) => {
  const { isAuthenticated, isLoading } = useAuth()

  const items = useMemo(
    () =>
      isAuthenticated
        ? PRODUCT_SORT_OPTIONS
        : PRODUCT_SORT_OPTIONS.filter(
            (option) => !PRICE_SORT_VALUES.includes(option.value)
          ),
    [isAuthenticated]
  )

  const { currentRefinement, options, refine } = useSortBy({ items })

  useEffect(() => {
    if (isLoading || isAuthenticated) {
      return
    }

    if (PRICE_SORT_VALUES.includes(currentRefinement)) {
      refine(PRODUCT_INDEX_NAME)
    }
  }, [isAuthenticated, isLoading, currentRefinement, refine])

  return (
    <select
      value={currentRefinement}
      onChange={(event) => refine(event.target.value)}
      aria-label="Sort results"
      className={
        className ||
        "px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
      }
      data-testid="sort-select"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          Sort: {option.label}
        </option>
      ))}
    </select>
  )
}

export default SortSelect
