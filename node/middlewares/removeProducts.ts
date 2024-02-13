import { json } from "co-body";
import { stringify } from "../utils/functions";
import { ALLOWED_FACETS, LIST_ENTITY, LIST_FIELDS } from "../utils/constants";


export async function removeProducts(ctx: Context, next: () => Promise<any>) {

  try {

    let request = await json(ctx.req);


    let pathVariables = ctx.vtex.route.params;

    let list = await ctx.clients.Vtex.searchDocumentV2(LIST_ENTITY, LIST_FIELDS, `email=${pathVariables.email}`)



    let updatedList: any = {
      category1: list[0].category1,
      category2: list[0].category2
    }

    console.log("updatedList:", JSON.stringify(updatedList,null,2))



    if (request.deleteList) {

      let res = await ctx.clients.Vtex.deleteDocumentV2(LIST_ENTITY, list[0].documentId);
      console.log("res:", res)

    } else {

      request.skuIds.forEach((skuId: any) => {

        updatedList.skuIds.filter((f:any) => f != skuId)

        ALLOWED_FACETS.forEach((facet: any) => {

          updatedList[facet].forEach((it: any) => {
            it.skuIds = it.skuIds.filter((f: any) => f != skuId)
          });

          updatedList[facet] = updatedList[facet].filter((f:any) => (f.skuIds.length > 0))

        })

      });

      let res = await ctx.clients.Vtex.updateDocumentV2(LIST_ENTITY, list[0].id, updatedList)

      console.log("res:", res)


    }

    console.log("updatedList2:", JSON.stringify(updatedList,null,2))



    await next();

  } catch (error) {
    ctx.status = 500;
    ctx.body = stringify(error)
  }


}
