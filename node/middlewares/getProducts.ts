import { ListRecord } from "../typings/md_entities";
import { GetProduct_Response } from "../typings/types";
import { LIST_ENTITY, LIST_FIELDS } from "../utils/constants";
import { getProductsList } from "../utils/listFunctions";


export async function getProducts(ctx: Context, next: () => Promise<any>) {
  try {



    let list: ListRecord[] = await ctx.clients.Vtex.searchDocumentV2(LIST_ENTITY, LIST_FIELDS, `email=${ctx.state.request.listId}`)
    if (list[0].existent == false) {
      throw new Error("#notExistentList")
    }


    let products = getProductsList(ctx.state.request.selectedFacets!, list[0])

    let response: GetProduct_Response = {
      data: {
        products: {
          pageInfo: {
            totalCount: products.length
          },
          edges: products
        }
      },
      errors: null
    }

    ctx.status = 200;
    ctx.body = response;


    await next();

  } catch (error) {

    if (error.message == "#notExistentList") {
      ctx.status = 400;
      ctx.body = {
        data: null,
        errors: [error.message]
      };
    } else {
      ctx.status = 500;
      ctx.body = {
        data: null,
        errors: [(error)]
      };
    }

  }
}






