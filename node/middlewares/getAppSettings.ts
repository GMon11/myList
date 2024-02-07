
import { APP } from "@vtex/api";
import { maxRetry, maxWaitTime } from "../utils/constants";
import { stringify, wait } from "../utils/functions";
import { cleanUpAntiThrottler } from "./antiThrottler";
import { AppSettings } from "../typings/config";

export async function getAppSettings(ctx: Context, next: () => Promise<any>) {
  try {
    ctx.state.appSettings = await getAppSettingsWithRetry(ctx);
    //set up of process environment variables, in order to pass information to clients
    await next();
  } catch (err) {
    ctx.state.logger.error(`${err.msg}`);
    (ctx as Context).status = 500;
    (ctx as Context).body = "Internal Server Error";
    cleanUpAntiThrottler(ctx);
  }
}

async function getAppSettingsWithRetry(ctx: Context, retry: number = 0): Promise<AppSettings> {
  return new Promise<AppSettings>((resolve, reject) => {
    ctx.clients.apps.getAppSettings(APP.ID)
      .then((res: any) => resolve(res))
      .catch(async (err: any) => {
        if (retry < maxRetry) {
          await wait(maxWaitTime);
          return getAppSettingsWithRetry(ctx, retry + 1).then(res0 => resolve(res0)).catch(err0 => reject(err0));
        } else {
          reject({ msg: `error while retrieving app settings --details: ${stringify(err)}` });
        }
      });
  })
}
