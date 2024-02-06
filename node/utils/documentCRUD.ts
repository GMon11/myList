import { maxRetry, maxWaitTime } from "./constants"
import { Pagination } from "../typings/md_entities";
import { stringify, wait } from "./functions";

export async function createDocument(ctx: Context | OrderEvent, dataEntity: string, fields: any, retry: number = 0): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    ctx.clients.masterdata.createDocument({ dataEntity: dataEntity, fields: fields })
      .then((res: any) => {
        resolve(res);
      })
      .catch(async (err: any) => {
        if (retry < maxRetry) {
          await wait(maxWaitTime);
          return createDocument(ctx, dataEntity, fields, retry + 1).then(res0 => resolve(res0)).catch(err0 => reject(err0));
        } else {
          reject({ msg: `Create ${dataEntity} failed  --details: ${stringify(err)}` });
        }
      })
  })
}

export async function getDocument(ctx: Context | OrderEvent, dataEntity: string, id: string, fields: any, retry: number = 0): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    ctx.clients.masterdata.getDocument({ dataEntity: dataEntity, id: id, fields: fields })
      .then((res: any) => {
        resolve(res);
      })
      .catch(async (err: any) => {
        if (retry < maxRetry) {
          await wait(maxWaitTime);
          return getDocument(ctx, dataEntity, id, fields, retry + 1).then(res0 => resolve(res0)).catch(err0 => reject(err0));
        } else {
          reject({ msg: `Get ${dataEntity} failed  --details: ${stringify(err)}` });
        }
      })
  })
}

export async function updatePartialDocument(ctx: Context | OrderEvent, dataEntity: string, id: string, fields: any, retry: number = 0): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    ctx.clients.masterdata.updatePartialDocument({ dataEntity: dataEntity, id: id, fields: fields })
      .then((res: any) => {
        resolve(res);
      })
      .catch(async (err: any) => {
        if (retry < maxRetry) {
          await wait(maxWaitTime);
          return updatePartialDocument(ctx, dataEntity, id, fields, retry + 1).then(res0 => resolve(res0)).catch(err0 => reject(err0));
        } else {
          reject({ msg: `Update ${dataEntity} failed  --details: ${stringify(err)}` });
        }
      })
  })
}

export async function searchDocuments(ctx: Context | OrderEvent, dataEntity: string, fields: string[], where: string, pagination: Pagination, retryIfNotFoundRecord: boolean = false, retry: number = 0): Promise<any[]> {
  return new Promise<any[]>((resolve, reject) => {
    ctx.clients.masterdata.searchDocuments({ dataEntity: dataEntity, fields: fields, where: where, pagination: pagination })
      .then(async (res: any) => {
        if (res.length == 0 && retryIfNotFoundRecord && retry < maxRetry) {
          await wait(maxWaitTime)
          return searchDocuments(ctx, dataEntity, fields, where, pagination, retryIfNotFoundRecord, retry + 1).then(res0 => resolve(res0)).catch(err0 => reject(err0));
        } else {
          resolve(res);
        }
      })
      .catch(async (err: any) => {
        if (retry < maxRetry) {
          await wait(maxWaitTime)
          return searchDocuments(ctx, dataEntity, fields, where, pagination, retryIfNotFoundRecord, retry + 1).then(res0 => resolve(res0)).catch(err0 => reject(err0));
        } else {
          reject({ msg: `Search ${dataEntity} failed  --details: ${stringify(err)}` });
        }
      })

  })
}

export async function scrollDocuments(ctx: Context | OrderEvent, dataEntity: string, fields: string[], where: string, output: any[] = [], token: string | undefined = undefined, size: number = 1000, retry: number = 0): Promise<any[]> {
  return new Promise<any[]>((resolve, reject) => {
    ctx.clients.masterdata.scrollDocuments({ dataEntity: dataEntity, fields: fields, where, mdToken: token, size: size })
      .then((res: any) => {
        output = output.concat(res.data);
        if (res.data.length < size) {
          resolve(output)
        } else {
          return scrollDocuments(ctx, dataEntity, fields, where, output, res.mdToken, size, retry).then(res0 => resolve(res0)).catch(err0 => reject(err0));
        }
        return;
      })
      .catch(async (err: any) => {
        if (retry < maxRetry) {
          await wait(maxWaitTime);
          return scrollDocuments(ctx, dataEntity, fields, where, output, token, size, retry + 1).then(res0 => resolve(res0)).catch(err0 => reject(err0));
        } else {
          reject({ msg: `Scroll ${dataEntity} failed --details: ${stringify(err)}` });
        }
      })
  })
}

export async function deleteDocument(ctx: Context | OrderEvent, dataEntity: string, id: string, retry: number = 0): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    ctx.clients.masterdata.deleteDocument({ dataEntity: dataEntity, id: id })
      .then((res: any) => {
        resolve(res);
      })
      .catch(async (err: any) => {
        if (retry < maxRetry) {
          await wait(maxWaitTime);
          return deleteDocument(ctx, dataEntity, id, retry + 1).then(res0 => resolve(res0)).catch(err0 => reject(err0));
        } else {
          reject({ msg: `Delete ${dataEntity} failed  --details: ${stringify(err)}` });
        }
      })
  })
}
