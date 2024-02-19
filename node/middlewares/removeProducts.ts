import { ALLOWED_FACETS, LIST_ENTITY, LIST_FIELDS } from "../utils/constants";
import { stringify } from "../utils/functions";


export async function removeProducts(ctx: Context, next: () => Promise<any>) {

  try {

    let list = await ctx.clients.Vtex.searchDocumentV2(LIST_ENTITY, LIST_FIELDS, `listId=${ctx.state.request.listId}`)


    console.log("ctx.state.request.listId:", ctx.state.request.listId)



    console.log("updatedList:", JSON.stringify(list[0], null, 2))

    if (ctx.state.request.deleteList) {
      let res = await ctx.clients.Vtex.deleteDocumentV2(LIST_ENTITY, list[0].documentId);
      console.log("res:", res)
    } else {


      list[0].skuIds = list[0].skuIds.filter((f: any) => f != ctx.state.request.skuId)

      ALLOWED_FACETS.forEach((facet: any) => {

        list[0][facet].forEach((it: any) => {
          it.skuIds = it.skuIds.filter((f: any) => f != ctx.state.request.skuId)
        });

        list[0][facet] = list[0][facet].filter((f: any) => (f.skuIds.length > 0))

      })

      console.log("updatedList2:", JSON.stringify(list[0], null, 2))


      let res = await ctx.clients.Vtex.updateDocumentV2(LIST_ENTITY, list[0].id, list[0])

      console.log("res:", res)


    }



    ctx.body = {
      deleted: true
    }


    await next();

  } catch (error) {

    console.log("error:", error)

    ctx.status = 500;
    ctx.body = stringify(error)
  }


}
