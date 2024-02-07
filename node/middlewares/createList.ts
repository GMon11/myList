import { stringify } from "querystring";
import { LIST_ENTITY, LIST_FIELDS } from "../utils/constants";
import { wait } from "../utils/functions";

export async function createList(ctx: Context, next: () => Promise<any>) {

  try {

    let skuContext = await ctx.clients.Vtex.getSkuContext(ctx.state.request.skuId);

    let categories = skuContext.data.ProductCategories;
    let catIds = Object.keys(categories)
    let catNames: any = []
    catIds.forEach(item => {
      catNames.push(categories[item])
    })

    let res = await ctx.clients.Vtex.searchDocumentV2(LIST_ENTITY, LIST_FIELDS, `email=${ctx.state.request.email}`)

    if (res.existent == false) {
      //create new list

      let payload = {
        email: ctx.state.request.email,
        category1: [{ label: catNames[0], categoryId: catIds[0], skuIds: [ctx.state.request.skuId] }],
        category2: [{ label: catNames[1], categoryId: catIds[1], skuIds: [ctx.state.request.skuId] }],
        name: "Lista custom 1"
      }

      await ctx.clients.Vtex.createDocumentV2(LIST_ENTITY, "prova", payload)

    } else {
      //update the existent one
      let category1_Update = updateCategoryFacet(res[0].category1, catIds, catNames, 0, ctx.state.request.skuId)
      let category2_Update = updateCategoryFacet(res[0].category2, catIds, catNames, 1, ctx.state.request.skuId)

      //not to update indicies
      await ctx.clients.Vtex.updateDocumentV2(LIST_ENTITY, res[0].id, {
        category1: category1_Update,
        category2: category2_Update
      })
    }

    //to be removed
    await wait(1000)
    let res1 = await ctx.clients.Vtex.searchDocumentV2(LIST_ENTITY, LIST_FIELDS, `email=${ctx.state.request.email}`)
    console.log("res1:", JSON.stringify(res1, null, 2))
    //END to be removed

    await next();

  } catch (error) {

    ctx.status = 500;
    ctx.body = stringify(error);
  }




}






export function updateCategoryFacet(categories: any, catIds: any, catNames: any, level: number = 0, skuId: string) {


  let categorySpecs = categories ? categories : []





  let found = false;
  for (let i = 0; i < categorySpecs.length && found == false; i++) {

    if (categorySpecs[i].categoryId == catIds[level]) {

      if (!categorySpecs[i].skuIds.includes(skuId)) {
        categorySpecs[i].skuIds.push(skuId)
      }
      found = true;
    }
  }
  if (!found) {
    categorySpecs.push({
      label: catNames[level],
      categoryId: catIds[level],
      skuIds: [skuId]
    })
  }

  return categorySpecs
}
