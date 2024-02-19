export const maxRetry = 10;
export const maxWaitTime = 250;

export const cipherKey = "36246a8fcf66b68a0cffe0eb70b7e63b";
export const cipherIV = "36f2d92fbc013353";

export const CRON_JOB_EXPRESSION = "*/5 * * * *";

export const SECONDARY_BUCKET = ""

export const LOGGER_ENTITY = "LC"

export enum ROUTE {
  UPDATE_LIST = "updateList",
  FETCH_FACETS = "getFacets",
  FETCH_PRODUCTS = "getProducts",
  REMOVE_PRODUCTS = "removeProducts"
}

export const LIST_ENTITY = "prova" //tbm
export const LIST_FIELDS = "id,listId,name,email,category1,category2,insertionDate,skuIds"

export const ALLOWED_FACETS = ["category1", "category2", "insertionDate"]

export enum TimeZone {
  Rome = 'Europe/Rome'
}

export const MONTH_NAMES_IT = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"]
