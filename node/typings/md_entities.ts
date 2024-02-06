export interface Pagination {
  page: number
  pageSize: number
}

export interface FBRecord {
  id?: string
  orderFormId: string
  referenceNumber: string
  reservationCode: string
  carrierCode: string
  status: string
  creationDate: string
  orderId?: string
  firstAvailableSlot: string
  selectedSlot: string
  docId?: string
}
