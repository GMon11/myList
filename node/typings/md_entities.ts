export interface Pagination {
  page: number
  pageSize: number
}

export interface Category_Field {
  label: string,
  value: string,
  categoryId: string,
  fatherCategoryId?: string | null,
  skuIds: string[],
}

export interface InsertionDate {
  date: Date | string,
  skuIds: string[]
}
export interface ListRecord {
  id?: string
  listId?: string
  skuIds?: string[],
  category1?: Category_Field[],
  category2?: Category_Field[],
  insertionDate?: InsertionDate[],
  existent?: boolean
}
