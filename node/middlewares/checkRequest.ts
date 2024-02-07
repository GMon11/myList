import { json } from "co-body";
import { ROUTE } from "../utils/constants";
import { isValid } from "../utils/functions";
import { stringify } from "querystring";


export async function checkRequest(ctx: Context, next: () => Promise<any>) {

  try {

    ctx.state.request = await json(ctx.req);

    switch (ctx.vtex.route.id) {
      case ROUTE.CREATE_LIST:
        if (!isValid(ctx.state.request) || !isValid(ctx.state.request.email) || !isValid(ctx.state.request.skuId)) {
          throw new Error("#notValidRequest")
        }
        await next()
        break;

      case ROUTE.FETCH_FACETS:
        await next()
        break;
    }

  } catch (error) {
    if (error.message = '#notValidRequest') {
      ctx.status = 400;
      ctx.body = stringify(error);
    } else {
      ctx.status = 500;
      ctx.body = "Internal Server Error";
    }
  }
}
