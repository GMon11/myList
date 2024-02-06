import { SECONDARY_BUCKET_FAREYE, maxRetry, maxWaitTime } from "./constants"
import { stringify, wait } from "./functions"

export async function saveObjInVbase(ctx: Context | OrderEvent, bucket: string, path: any, data: any, retry: number = 0): Promise<any> {
  bucket == SECONDARY_BUCKET_FAREYE

  return new Promise<any>((resolve, reject) => {
    ctx.clients.vbase.saveJSON(bucket, path, data)
      .then(res => resolve(res))
      .catch(async (err) => {
        if (retry < maxRetry) {
          await wait(maxWaitTime);
          return saveObjInVbase(ctx, bucket, path, data, retry + 1).then(res0 => resolve(res0)).catch(err0 => reject(err0));
        } else {
          reject({ msg: `Error while storing data in the bucket ${bucket} for the ref ${path} --data: ${stringify(data)} --details: ${stringify(err)}` })
        }
      })
  })
}

export async function getObjFromVbase(ctx: Context | OrderEvent, bucket: string, path: string, retry: number = 0): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    ctx.clients.vbase.getJSON(bucket, path, true)
      .then(res => resolve(res))
      .catch(async (err) => {
        if (retry < maxRetry) {
          await wait(maxWaitTime);
          return getObjFromVbase(ctx, bucket, path, retry + 1).then(res0 => resolve(res0)).catch(err0 => reject(err0));
        } else {
          reject({ msg: `Error while fetching data from the bucket ${bucket} for the ref ${path} --details: ${stringify(err)}` })
        }
      })
  })
}

export async function deleteObjFromVbase(ctx: Context | OrderEvent, bucket: string, path: string, retry: number = 0): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    ctx.clients.vbase.deleteFile(bucket, path)
      .then(res => resolve(res))
      .catch(async (err) => {
        if (retry < maxRetry) {
          await wait(maxWaitTime);
          return deleteObjFromVbase(ctx, bucket, path, retry + 1).then(res0 => resolve(res0)).catch(err0 => reject(err0));
        } else {
          reject({ msg: `Error while deleting data from the bucket ${bucket} for the ref ${path} --details: ${stringify(err)}` })
        }
      })
  })
}
