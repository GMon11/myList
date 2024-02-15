import { ALLOWED_FACETS, LIST_ENTITY, LIST_FIELDS } from "../utils/constants";
import { stringify } from "../utils/functions";


export async function removeProducts(ctx: Context, next: () => Promise<any>) {

  try {



    let list = await ctx.clients.Vtex.searchDocumentV2(LIST_ENTITY, LIST_FIELDS, `listId=${ctx.state.request.listId}`)



    let updatedList: any = {
      category1: list[0].category1,
      category2: list[0].category2
    }

    console.log("updatedList:", JSON.stringify(updatedList, null, 2))



    if (ctx.state.request.deleteList) {

      let res = await ctx.clients.Vtex.deleteDocumentV2(LIST_ENTITY, list[0].documentId);
      console.log("res:", res)

    } else {


      updatedList.skuIds.filter((f: any) => f != ctx.state.request.skuId)

      ALLOWED_FACETS.forEach((facet: any) => {

        updatedList[facet].forEach((it: any) => {
          it.skuIds = it.skuIds.filter((f: any) => f != ctx.state.request.skuId)
        });

        updatedList[facet] = updatedList[facet].filter((f: any) => (f.skuIds.length > 0))

      })


      let res = await ctx.clients.Vtex.updateDocumentV2(LIST_ENTITY, list[0].id, updatedList)

      console.log("res:", res)


    }

    console.log("updatedList2:", JSON.stringify(updatedList, null, 2))


    ctx.body = {
      deleted: true
    }


    await next();

  } catch (error) {
    ctx.status = 500;
    ctx.body = stringify(error)
  }


}
