import { CacheLayer, InstanceOptions, IOContext, IOResponse, JanusClient } from "@vtex/api";

import { stringify, wait } from "../utils/functions";
import { Order } from "../typings/order";


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
    this.MAX_RETRY = 5;
    this.memoryCache = options && options?.memoryCache;
  }

  public async getSkuContext(skuId: any, retry: number = 0): Promise<IOResponse<any>> {
    return new Promise<IOResponse<any>>((resolve, reject) => {
      if (this.memoryCache?.has(this.context.account + "-skuContext-" + skuId)) {
        resolve(this.memoryCache.get(this.context.account + "-skuContext-" + skuId))
      } else {
        this.http.getRaw(`/api/catalog_system/pvt/sku/stockkeepingunitbyid/${skuId}`)
          .then(res => {
            this.memoryCache?.set(this.context.account + "-skuContext-" + skuId, res.data);
            resolve(res.data);
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

}
