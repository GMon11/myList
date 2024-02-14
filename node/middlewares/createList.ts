import { stringify } from "querystring";
import { LIST_ENTITY, LIST_FIELDS, TimeZone } from "../utils/constants";
import { getLocalDateTime, wait } from "../utils/functions";

export async function createList(ctx: Context, next: () => Promise<any>) {

  try {

    let skuContext = await ctx.clients.Vtex.getSkuContext(ctx.state.request.skuId);

    let categories = skuContext.data.ProductCategories;
    let catIds = Object.keys(categories)
    let catNames: any = []
    catIds.forEach(item => {
      catNames.push(categories[item])
    })

    let res = await ctx.clients.Vtex.searchDocumentV2(LIST_ENTITY, LIST_FIELDS, `email=${ctx.vtex.route.params.email}`)


    console.log("res:", res)

    if (res.existent == false) {
      //create new list
      let currentDate = getLocalDateTime(TimeZone.Rome);

      let payload = {
        email: ctx.state.request.listId,
        skuIds: [ctx.state.request.skuId],
        category1: [{ label: catNames[0], categoryId: catIds[0], skuIds: [ctx.state.request.skuId] }],
        category2: [{ label: catNames[1], categoryId: catIds[1], fatherCategoryId: catIds[0], skuIds: [ctx.state.request.skuId] }],
        insertionDate: [{ date: currentDate, skuIds: [ctx.state.request.skuId] }]
      }

      let res3 = await ctx.clients.Vtex.createDocumentV2(LIST_ENTITY, "prova", payload)

      console.log("res3:", res3)


    } else {

      //update the existent one
      let skuIds_Update = updateAllSkuIds(res[0].skuIds, ctx.state.request.skuId!);

      console.log("skuIds_Update:", skuIds_Update)

      let category1_Update = updateCategoryFacet(res[0].category1, catIds, catNames, 0, ctx.state.request.skuId!);
      let category2_Update = updateCategoryFacet(res[0].category2, catIds, catNames, 1, ctx.state.request.skuId!);
      let insertionDate_Update = updateInsertionDate(res[0].insertionDate, ctx.state.request.skuId!);

      //insertion date will change on second insert??


      //not to update indicies
      await ctx.clients.Vtex.updateDocumentV2(LIST_ENTITY, res[0].id, {
        category1: category1_Update,
        category2: category2_Update,
        insertionDate: insertionDate_Update,
        skuIds: skuIds_Update
      })

    }

    //to be removed
    await wait(1000)
    let res1 = await ctx.clients.Vtex.searchDocumentV2(LIST_ENTITY, LIST_FIELDS, `email=${ctx.state.request.listId}`)
    console.log("res1:", JSON.stringify(res1, null, 2))
    //END to be removed

    await next();

  } catch (error) {

    console.log("error:", error)


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
      fatherCategoryId: level == 1 ? catIds[0] : null,
      skuIds: [skuId]
    })
  }

  return categorySpecs
}

export function updateInsertionDate(insertionDates: any, skuId: string) {

  let currentDate = getLocalDateTime(TimeZone.Rome);

  let date = currentDate.toLocaleDateString()

  console.log("date:", date)

  let found = false
  for (let i = 0; i < insertionDates.length && found == false; i++) {


    let date2 = new Date(insertionDates[i].date)

    console.log("date2:", date2)


    let dbDate = date2.toLocaleDateString()



    console.log("dbDate:", dbDate)


    if (dbDate == date) {
      console.log("hole");

      if (!insertionDates[i].skuIds.includes(skuId)) {
        insertionDates[i].skuIds.push(skuId);
      }
      found = true;
    }

  }
  if (!found) {
    insertionDates.push({
      date: getLocalDateTime(TimeZone.Rome),
      skuIds: [skuId]
    })
  }

  return insertionDates
}

export function updateAllSkuIds(skuIds: any, skuId: string) {
  let skuIds_Update = skuIds
  if (!skuIds.includes(skuId)) {
    skuIds_Update.push(skuId)
  }
  return skuIds_Update
}
