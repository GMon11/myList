import { LIST_ENTITY, LIST_FIELDS } from "../utils/constants";
import { getProductsList } from "../utils/listFunctions";


export async function getProducts(ctx: Context, next: () => Promise<any>) {
  try {



    let list = await ctx.clients.Vtex.searchDocumentV2(LIST_ENTITY, LIST_FIELDS, `email=${ctx.state.request.listId}`)
    if (list.existent == false) {
      throw new Error("#notExistentList")
    }


    let products: any = getProductsList(ctx.state.request.selectedFacets, list)

    ctx.status = 200;
    ctx.body = {
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






