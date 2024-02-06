import { ExternalClient, InstanceOptions, IOContext } from "@vtex/api";
import { stringify, wait } from "../utils/functions";
import { OrderForm } from "../typings/orderForm";

export default class OrderFormClient extends ExternalClient {
  private MAX_TIME: number;
  private MAX_RETRY: number;

  constructor(context: IOContext, options?: InstanceOptions) {
    options!.headers = { ...options?.headers, ...{ VtexIdclientAutCookie: context.storeUserAuthToken || context.authToken } }//to be checked if we need the user cookies on the public domains
    super(`http://${context.host}`, context, options)
    this.MAX_TIME = 250;
    this.MAX_RETRY = 5;
  }

  public async getOrderForm(orderFormId?: string, cookies: string[] = [], retry: number = 0): Promise<OrderForm> {
    this.options!.headers = {
      ...this.options?.headers,
      ...(cookies?.length ? { Cookie: cookies.join(";") } : {})
    }
    return new Promise<OrderForm>((resolve, reject) => {
      this.http.get(`/api/checkout/pub/orderForm/${orderFormId}`, this.options)
        .then(res => {
          resolve(res);
        })
        .catch(async (err) => {
          if (retry < this.MAX_RETRY) {
            await wait(this.MAX_TIME);
            return this.getOrderForm(orderFormId, cookies, retry + 1).then(res0 => resolve(res0)).catch(err0 => reject(err0));
          } else {
            reject({ msg: `Error while retrieving order form (orderFormid: ${orderFormId}) --details: ${stringify(err)}` });
          }
        })
    })
  }

  public async fillInCustomData(orderFormId: string, customAppId: string, data: any, cookies: string[] = [], retry: number = 0): Promise<OrderForm> {
    this.options!.headers = {
      ...this.options?.headers,
      ...{
        Cookie: cookies.join(";")
      }
    }
    return new Promise<OrderForm>((resolve, reject) => {
      this.http.put(`/api/checkout/pub/orderForm/${orderFormId}/customData/${customAppId}`, data, this.options)
        .then((res: any) => resolve(res))
        .catch(async (err) => {
          if (retry < this.MAX_RETRY) {
            await wait(this.MAX_TIME);
            return this.fillInCustomData(orderFormId, customAppId, data, cookies, retry + 1).then(res0 => resolve(res0)).catch(err0 => reject(err0));
          } else {
            reject({ msg: `Error while filling in customData (orderFormid: ${orderFormId}) --details: ${stringify(err)}` });
          }
        })
    })
  }

  public async deleteCustomData(orderFormId: string, customAppId: string, customField: string, cookies: string[] = [], retry: number = 0): Promise<OrderForm> {
    this.options!.headers = {
      ...this.options?.headers,
      ...{
        Cookie: cookies.join(";")
      }
    }
    return new Promise<OrderForm>((resolve, reject) => {
      this.http.delete(`/api/checkout/pub/orderForm/${orderFormId}/customData/${customAppId}/${customField}`, this.options)
        .then((res: any) => resolve(res))
        .catch(async (err) => {
          if (retry < this.MAX_RETRY) {
            await wait(this.MAX_TIME);
            return this.deleteCustomData(orderFormId, customAppId, customField, cookies, retry + 1).then(res0 => resolve(res0)).catch(err0 => reject(err0));
          } else {
            reject({ msg: `Error while deleting the custom field ${customField} (orderFormid: ${orderFormId}) --details: ${stringify(err)}` });
          }
        })
    })
  }

}
