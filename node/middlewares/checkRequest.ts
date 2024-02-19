import { json } from "co-body";
import { ROUTE } from "../utils/constants";
import { isValid } from "../utils/functions";
import { stringify } from "querystring";


export async function checkRequest(ctx: Context, next: () => Promise<any>) {

  try {

    ctx.state.request = await json(ctx.req);

    console.log("ctx.state.request:", ctx.state.request)


    if (ctx.vtex.route.id == ROUTE.UPDATE_LIST || ctx.vtex.route.id == ROUTE.REMOVE_PRODUCTS) {
      if (!isValid(ctx.state.request) || !isValid(ctx.state.request.skuId)) {
        throw new Error("#notValidRequest");
      }
    } else if (
      ctx.vtex.route.id == ROUTE.FETCH_FACETS ||
      ctx.vtex.route.id == ROUTE.FETCH_PRODUCTS
    ) {

      if (!isValid(ctx.state.request.listId) || isValid(ctx.state.request.selectedFacets?.length)) {
        throw new Error("#notValidRequest");
      }
    }

    await next()

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
