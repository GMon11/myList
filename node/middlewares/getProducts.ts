import { json } from "co-body";
import { LIST_ENTITY, LIST_FIELDS } from "../utils/constants";


export async function getProducts(ctx: Context, next: () => Promise<any>) {
  try {

    let request = await json(ctx.req);

    let pathVariables = ctx.vtex.route.params;


    let list = await ctx.clients.Vtex.searchDocumentV2(LIST_ENTITY, LIST_FIELDS, `email=${pathVariables.email}`)


    console.log("list:", JSON.stringify(list, null, 2))

    let products: any = []

    if (request.selectedFacets.length > 0) {


      request.selectedFacets.forEach((facet: any) => {

        //aggiungere check sulla validità della key

        let fProducts = getFilteredProducts(facet, list)
        if (fProducts && fProducts.length > 0) {
          products.push(fProducts)
        }
        if(products.length > 1){
          products = products[0].filter((x:any) => products[1].includes(x))
        }
      });

      products = (Array.isArray(products[0])) ? products[0] : products

    } else {
      products.push(list[0].skuIds)
    }

    console.log("products:", products)

    ctx.status = 200;
    ctx.body = {
      products: {
        pageInfo: {
          totalCount: products.length
        },
        edges: products
      }
    }


    await next();

  } catch (err) {

    console.log("err:", err)

    ctx.status = 500;
  }
}

export function getFilteredProducts(facet: any, list: any) {

  console.log("facet:", facet)

  let filteredProducts: any = []

  if (list[0][facet.key]) {


    list[0][facet.key].forEach((item: any) => {
      if (item.label == facet.value) {
        item.skuIds.forEach((skuId: any) => {
          filteredProducts.push(skuId)
        });
      }
    });
  }

  return filteredProducts;

}

