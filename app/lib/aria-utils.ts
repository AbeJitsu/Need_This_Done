/**
 * Get the appropriate aria-sort value for a sortable table header
 * @param field - The field name of the column
 * @param currentSortField - The currently sorted field
 * @param sortDirection - The current sort direction
 * @returns The aria-sort value: 'ascending', 'descending', or undefined
 */
export function getAriaSortValue(
  field: string,
  currentSortField: string | null,
  sortDirection: 'asc' | 'desc' | undefined
): 'ascending' | 'descending' | undefined {
  if (field !== currentSortField) {
    return undefined;
  }

  if (sortDirection === 'asc') {
    return 'ascending';
  }

  if (sortDirection === 'desc') {
    return 'descending';
  }

  return undefined;
}