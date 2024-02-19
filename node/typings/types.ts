export interface FacetValue {
  quantity: number,
  label: string,
  value: string,
  selected: boolean
}

export interface Facet {
  label: string,
  values: FacetValue[]
}

interface GetFacets_Data {
  facets: Facet[]
}
export interface GetFacets_Response {
  data: GetFacets_Data,
  errors: any
}

interface GetProducts_Data {

  products: {
    pageInfo: {
      totalCount: number
    }
    edges: string[]
  }
}
export interface GetProduct_Response {
  data: GetProducts_Data,
  errors: any
}
