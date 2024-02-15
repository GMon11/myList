import { CacheLayer, InstanceOptions, IOContext, IOResponse, JanusClient } from "@vtex/api";

import { Order } from "../typings/order";
import { stringify, wait } from "../utils/functions";


export default class Vtex extends JanusClient {

  private memoryCache?: CacheLayer<string, any>;
  private MAX_TIME: number;
  private MAX_TIME_ASYNC: number;
  private MAX_RETRY: number;

  constructor(context: IOContext, options?: InstanceOptions) {
    options!.headers = { ...options?.headers, ...{ VtexIdclientAutCookie: context.authToken } }
    super(context, options);
    this.MAX_TIME = 250;
    this.MAX_TIME_ASYNC = 1500;
    this.MAX_RETRY = 0;
    this.memoryCache = options && options?.memoryCache;
  }

  public async getSkuContext(skuId: any, retry: number = 0): Promise<IOResponse<any>> {
    return new Promise<IOResponse<any>>((resolve, reject) => {
      if (this.memoryCache?.has(this.context.account + "-skuContext-" + skuId)) {
        resolve(this.memoryCache.get(this.context.account + "-skuContext-" + skuId))
      } else {
        this.http.getRaw(`/api/catalog_system/pvt/sku/stockkeepingunitbyid/${skuId}`)
          .then(res => {
            this.memoryCache?.set(this.context.account + "-skuContext-" + skuId, res);
            resolve(res);
          })
          .catch(async (err) => {
            if (retry < this.MAX_RETRY) {
              await wait(this.MAX_TIME);
              return this.getSkuContext(skuId, retry + 1).then(res0 => resolve(res0)).catch(err0 => reject(err0))
            } else {
              reject({ msg: `Error while retrieving sku context (skuId: ${skuId}) --details: ${stringify(err)}` })
            }
          })
      }
    })
  }

  public async getOrder(orderId: string, retry: number = 0): Promise<Order> {
    return new Promise<Order>((resolve, reject) => {
      this.http.get(`/api/oms/pvt/orders/${orderId}`)
        .then(res => resolve(res))
        .catch(async (err) => {
          if (retry < this.MAX_RETRY) {
            await wait(this.MAX_TIME_ASYNC);
            return this.getOrder(orderId, retry + 1).then(res0 => resolve(res0)).catch(err0 => reject(err0));
          } else {
            reject({ msg: `Error while retrieving order data (orderId: ${orderId}) --details: ${stringify(err)}` });
          }
        })
    })
  }

  public async getCategory(categoryId: any, retry: number = 0): Promise<IOResponse<any>> {
    return new Promise<IOResponse<any>>((resolve, reject) => {
      if (this.memoryCache?.has(this.context.account + "-category-" + categoryId)) {
        resolve(this.memoryCache?.get(this.context.account + "-category-" + categoryId))
      } else {
        this.http.getRaw("/api/catalog/pvt/category/" + categoryId)
          .then(res => {
            this.memoryCache?.set(this.context.account + "-category-" + categoryId, res.data);
            resolve(res.data);
          })
          .catch(async (err) => {
            if (retry < this.MAX_RETRY) {
              await wait(this.MAX_TIME);
              return this.getCategory(categoryId, retry + 1).then(res0 => resolve(res0)).catch(err0 => reject(err0));
            } else {
              reject({ msg: `Error while retrieving category data (categoryId: ${categoryId}) --details: ${stringify(err)}` });
            }
          })
      }
    })
  }

  public async searchDocumentV2(dataEntityName: string, fields: string = "all", queryParams: string | null = null, retry: number = 0): Promise<any> {
    return new Promise<any>((resolve, reject) => {

      this.http.get(`/api/dataentities/${dataEntityName}/search?_fields=${fields}` + ((queryParams) ? ("&" + queryParams) : ""))
        .then(res => {

          resolve(res);
        })
        .catch(async (err) => {

         if(err.response.data.Message == "Field 'listId' not found in schema"){
          resolve([{existent: false}])
         }


          if (retry < this.MAX_RETRY) {
            await wait(this.MAX_TIME);
            return this.searchDocumentV2(dataEntityName, fields, queryParams, retry + 1).then(res0 => resolve(res0)).catch(err0 => reject(err0));
          } else {
            reject({ msg: `Error while retrieving data (dataEntity: ${dataEntityName}) --details: ${stringify(err)}` });
          }
        })

    })
  }

  public async createDocumentV2(dataEntityName: string, schema: string = "v1", data: any, retry: number = 0): Promise<any> {
    return new Promise<any>((resolve, reject) => {

      this.http.put(`/api/dataentities/${dataEntityName}/documents?_schema=${schema}`, data)
        .then((res: any) => {

          resolve(res);
        })
        .catch(async (err) => {

          if (err.response.statusText == "Not Modified") {
            resolve(true)

          } else {

            if (retry < this.MAX_RETRY) {
              wait(this.MAX_TIME);
              return this.createDocumentV2(dataEntityName, schema, data, retry + 1).then(res0 => resolve(res0)).catch(err0 => reject(err0));
            } else {
              reject({ msg: `Error while retrieving data (dataEntity: ${dataEntityName}) --details: ${stringify(err.response)}` });
            }
          }
        })

    })
  }

  public async updateDocumentV2(dataEntityName: string, documentId: string, data: any, retry: number = 0): Promise<any> {
    return new Promise<any>((resolve, reject) => {

      this.http.patch(`/api/dataentities/${dataEntityName}/documents/${documentId}`, data)
        .then((res: any) => {

          resolve(res);
        })
        .catch(async (err) => {

        console.log("err:", err.response)


          if (err.response.statusText == "Not Modified") {
            resolve(true)

          } else {

            if (retry < this.MAX_RETRY) {
              wait(this.MAX_TIME);
              return this.createDocumentV2(dataEntityName, documentId, data, retry + 1).then(res0 => resolve(res0)).catch(err0 => reject(err0));
            } else {
              reject({ msg: `Error while retrieving data (dataEntity: ${dataEntityName}) --details: ${stringify(err.response)}` });
            }
          }
        })

    })
  }

  public async deleteDocumentV2(dataEntityName: string, documentId: string, retry: number = 0): Promise<any> {
    return new Promise<any>((resolve, reject) => {

      this.http.delete(`/api/dataentities/${dataEntityName}/documents/${documentId}`)
        .then((res: any) => {

          resolve(res);
        })
        .catch(async (err) => {

            if (retry < this.MAX_RETRY) {
              wait(this.MAX_TIME);
              return this.deleteDocumentV2(dataEntityName, documentId, retry + 1).then(res0 => resolve(res0)).catch(err0 => reject(err0));
            } else {
              reject({ msg: `Error while deleting data (dataEntity: ${dataEntityName}) --details: ${stringify(err.response)}` });
            }

        })

    })
  }

}
