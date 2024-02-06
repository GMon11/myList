import { TooManyRequestsError } from "@vtex/api";
import { requests } from "..";

export async function antiThrottler(ctx: Context , next: () => Promise<any>) {
  if (ctx.vtex?.route?.id && ctx.vtex?.route?.params?.orderFormId) {
    if (!requests[`${ctx.vtex.account}-${ctx.vtex.route.id}-${ctx.vtex.route.params.orderFormId as string}`]) {
      requests[`${ctx.vtex.account}-${ctx.vtex.route.id}-${ctx.vtex.route.params.orderFormId as string}`] = 0;
    }
    if (requests[`${ctx.vtex.account}-${ctx.vtex.route.id}-${ctx.vtex.route.params.orderFormId as string}`] < 1) {
      requests[`${ctx.vtex.account}-${ctx.vtex.route.id}-${ctx.vtex.route.params.orderFormId as string}`] += + 1;
      await next();
    }
    else {
      throw new TooManyRequestsError();
    }
  } else {
    await next();
  }
}

export function cleanUpAntiThrottler(ctx: Context ): void {
  if (ctx.vtex?.route?.id && ctx.vtex?.route?.params?.orderFormId) {
    if (requests[`${ctx.vtex.account}-${ctx.vtex.route.id}-${ctx.vtex.route.params.orderFormId as string}`]) {
      requests[`${ctx.vtex.account}-${ctx.vtex.route.id}-${ctx.vtex.route.params.orderFormId as string}`] -= 1;
    }
  }
  return;
}
