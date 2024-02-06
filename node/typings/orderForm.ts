export interface ItemAddInfoOF {
  brandName: string
  brandId: string
}

export interface BundleItemAddInfoOF {
  offeringType: string
  offeringTypeId: string
}

export interface BundleItemOF {
  uniqueId: string
  id: string
  name: string
  price: number
  listPrice: number
  sellingPrice: number
  additionalInfo: BundleItemAddInfoOF
  quantity: number
}

export interface ItemOF {
  uniqueId: string
  id: string // sku id
  productId: string
  productRefId: string
  refId: string // sku ref id
  ean: string
  name: string
  modalType: string // SDA (freestanding microwaves) => WHITE_GOODS ; GAS Appliances => FURNITURE
  price: number
  listPrice: number
  sellingPrice: number
  additionalInfo: ItemAddInfoOF
  productCategoryIds: string
  productCategories: any // categoryId --> categoryName
  quantity: number
  seller: string
  imageUrl: string
  detailUrl: string
  bundleItems: BundleItemOF[]
  availability: string
  ignore?: boolean
  [key:string]: any
  preSaleDate: string | null
}

export interface AddressOF {
  addressType: string
  receiverName: string
  addressId: string
  postalCode: string
  city: string
  state: string
  country: string
  street: string
  number: string // null
  neighborhood: string // null
  complement: string // house number (wrong mapping)
  reference: string // toogle ? "With stairs" : ""
}

export interface DeliveryIDOF {
  courierId: string
  warehouseId: string
  dockId: string
  courierName: string
  quantity: number
}

export interface DeliveryWindowOF {
  startDateUtc: string
  endDateUtc: string
  price: number
  lisPrice: number
}

export interface SLAOF {
  id: string
  name: string
  deliveryIds: DeliveryIDOF[]
  shippingEstimate: string // e.g. 0d
  shippingEstimateDate: string
  availableDeliveryWindows: DeliveryWindowOF[]
  deliveryWindow: DeliveryWindowOF // selected delivery window
  price: number
  listPrice: number
}

export interface LogisticsInfoOF {
  itemIndex: number
  selectedSla: string // Shipping Policy Name e.g. "Scheduled"
  slas: SLAOF[]
  itemId: string
}

export interface ShippingDataOF {
  address: AddressOF
  logisticsInfo: LogisticsInfoOF[]
}

export interface ClientProfileDataOF {
  email: string // this is the real one e.g. luca_blasi_reply@whirlpool.com
  firstName: string
  lastName: string
  phone: string // e.g. +44122334456
}

export interface StorePreferencesDataOF {
  countryCode: string //e.g. GBR
  currencyCode: string // e.g. GBP
  currencySymbol: string // e.g. £
}

export interface CustomAppOF {
  fields: any // id = "tradeplace" => fields = { connectedGas: string shipTogether: string tpError: string } => boolean values converted in string
  id: string
  major: number
}

export interface TotalizerOF {
  id: string // e.g. Items or Shipping
  name: string
  value: number // e.g. 100000
}

export interface OrderForm {
  orderFormId: string
  salesChannel: string
  userProfileId?: string
  value: number
  items: ItemOF[]
  totalizers: TotalizerOF[]
  shippingData: ShippingDataOF
  clientProfileData: ClientProfileDataOF
  clientPreferencesData: {
    locale: string // e.g. en-GB
    optinNewsLetter: boolean
  }
  storePreferencesData: StorePreferencesDataOF
  openTextField?: {
    value: string // order notes
  }
  customData: {
    customApps: CustomAppOF[]
  }
}
