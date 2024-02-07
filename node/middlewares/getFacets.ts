import { ALLOWED_FACETS, LIST_ENTITY, LIST_FIELDS } from "../utils/constants";
import { stringify } from "../utils/functions";


export async function getFacets(ctx: Context, next: () => Promise<any>) {

  try {
    console.log("hello man");

    let pathVariables = ctx.vtex.route.params;

    console.log("queryParams:", pathVariables)

    console.log(ctx.query);

    let queryParamsKeys = Object.keys(ctx.query)

    queryParamsKeys.forEach(it => {
      if(!ALLOWED_FACETS.includes(it)){
        throw new Error("#notAllowedFacet")
      }
    })

    //previous need to be moved in check request

    let list = await ctx.clients.Vtex.searchDocumentV2(LIST_ENTITY, LIST_FIELDS, `email=${pathVariables.email}`)


    console.log("list:", list)


    await next();

  } catch (error) {
    ctx.status = 500;
    ctx.body = stringify(error)
  }

}
