import { json } from "co-body";
import { LIST_ENTITY, LIST_FIELDS, MONTH_NAMES_IT, TimeZone } from "../utils/constants";
import { getLocalDateTime } from "../utils/functions";


export async function getFacetsD(ctx: Context, next: () => Promise<any>) {

  try {

    let request = await json(ctx.req);

    console.log("request:", request)

    let pathVariables = ctx.vtex.route.params;

    //da implementare il check sui filtri già selezionati e fare il match ritornando solo gli stessi

    let list = await ctx.clients.Vtex.searchDocumentV2(LIST_ENTITY, LIST_FIELDS, `email=${pathVariables.email}`)

    if (list.existent == false) {
      throw new Error("#notExistentList")
    }

    let facets: any = []

    let category1SelectedFacet: any = []
    let category2SelectedFacet: any = []


    if (request.selectedFacets.length > 0) {

      request.selectedFacets.forEach((el: any) => {

        if (el.key == "category1") {
          category1SelectedFacet.push({
            el,
            categoryId: list[0].category1.find((element: any) => element.label == el.value).categoryId

          })
        } else if (el.key == "category2") {
          category2SelectedFacet.push({
            el,
            fatherCategoryId: list[0].category2.find((element: any) => element.label == el.value).fatherCategoryId
          })
        }
      });
    }

    //standard facet
    let categories = getCategoriesFacet(list[0], "Animale", "Tipo di prodotto", category1SelectedFacet, category2SelectedFacet)

    console.log("categories:", categories.allSkus)

    let dateFacet = getDateFacet(list[0], categories.allSkus)

    facets.push(categories.category1)
    facets.push(categories.category2)
    facets.push(dateFacet)


    ctx.status = 200;
    ctx.body = {
      data:
      {
        facets: facets
      },
      errors: null
    }

    await next();

  } catch (error) {

    console.log("error:", error)

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

export function getCategoriesFacet(categoryList: any, label1: string, label2: string, category1Facets: any, category2Facets: any) {

  let cat1values: { label: string, quantity: number, isSelected: boolean }[] = []
  let cat2values: { label: string, quantity: number, isSelected: boolean }[] = []

  let allSkus: any = []
  let allSkusCat1: any = []


  let skus: any = []
  categoryList.category1.forEach((el: any) => {
    let isSelected = false

    if ((category1Facets.find((facet: any) => facet.el.value == el.label))) { isSelected = true }
    //get values
    cat1values = getFacetValues(cat1values, el, isSelected);

    allSkusCat1 = allSkusCat1.concat(el.skuIds)
  });


  //get all products filtered

  //get all facet

  console.log("skus:", skus)


  let category1 = {
    label: label1,
    values: cat1values
  }

  let allSkusCat2: any = []
  categoryList.category2.forEach((el: any) => {

    let isSelected = false
    if ((category2Facets.find((facet: any) => facet.el.value == el.label))) { isSelected = true }

    if (category1Facets.length > 0) {
      //could be more than one
      category1Facets.forEach((item: any) => {
        if (item.categoryId == el.fatherCategoryId) {
          cat2values.push({
            label: el.label,
            quantity: el.skuIds.length,
            isSelected: isSelected
          })
          allSkusCat2 = allSkusCat2.concat(el.skuIds)
        }
      });

    } else {
      cat2values = getFacetValues(cat2values, el, isSelected);
      allSkusCat2 = allSkusCat2.concat(el.skuIds)
    }

    allSkus = allSkusCat1.filter((x: any) => allSkusCat2.includes(x))

  });

  let category2 = {
    label: label2,
    values: cat2values
  }



  return { category1, category2, allSkus }
}

function getFacetValues(values: any, el: any, isSelected: boolean) {
  let found = false;

  for (let i = 0; i < values.length && found == false; i++) {
    if (values[i].label == el.label) {
      values[i].quantity += el.skuIds.length;
      found = true;
    }
  }
  if (!found) {
    values.push({
      label: el.label,
      quantity: el.skuIds.length,
      isSelected: isSelected
    })
  }
  return values
}

export function getDateFacet(list: any, allSkus: any) {

  let allDate: any = []

  list.insertionDate.forEach((it: any) => {

    let quantity = it.skuIds.filter((x: any) => allSkus.includes(x)).length

    if (quantity > 0)
      allDate.push({ date: it.date, quantity: quantity })
  });

  let months: any = []

  allDate.forEach((item: any) => {

    let month = new Date(item.date).getMonth();

    let found = false;
    for (let i = 0; i < months.length && found == false; i++) {
      if (months[i].month == month) {
        months[i].quantity += item.quantity;
        found = true;
      }
    }
    if (!found) {
      months.push({
        month: month,
        label: MONTH_NAMES_IT[month],
        quantity: item.quantity
      })
    }

  });

  /* let last14day:any = []
  let lastWeek:any = [] */

  let currentDate = getLocalDateTime(TimeZone.Rome)

  var week = new Date(currentDate);
  week.setDate(week.getDate() - 7);


  let insertionDateFacet = {
    label: "Data",
    values: months
  }

  return insertionDateFacet
}
