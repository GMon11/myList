import { LIST_ENTITY, LIST_FIELDS, MONTH_NAMES_IT, TimeZone } from "../utils/constants";
import { getLocalDateTime } from "../utils/functions";
import { getProductsList } from "../utils/listFunctions";


export async function getFacets(ctx: Context, next: () => Promise<any>) {

  try {




    let list = await ctx.clients.Vtex.searchDocumentV2(LIST_ENTITY, LIST_FIELDS, `email=${ctx.state.request.listId}`)

    if (list.existent == false) {
      throw new Error("#notExistentList")
    }

    let facets: any = []

    let products: any = getProductsList(ctx.state.request.selectedFacets, list)

    let allFacets = [
      { key: "category1", label: "Animale" },
      { key: "category2", label: "Tipo di prodotto" },
      { key: "insertionDate", label: "Data di aggiunta" }] //by appsettings

    list[0].insertionDate = mapDate(list[0])

    let facetKeys: any = []
    allFacets.forEach((facet: any) => {

      let included = false;
      ctx.state.request.selectedFacets?.forEach((selectedFacet: any) => {

        if (selectedFacet.key == facet.key && !facetKeys.includes(selectedFacet.key)) {
          facetKeys.push(selectedFacet.key)

          let values = getAllValues(facet.key, list[0], selectedFacet)
          facets.push({
            label: facet.label,
            values: values
          })

          included = true;
        }

      })
      if (!included) {
        let values = getValuesFiltered(facet.key, list[0], products)
        facets.push({
          label: facet.label,
          values: values
        })
      }
    })

    ctx.status = 200;
    ctx.body = {
      data: {
        facets: facets
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

function getAllValues(facet: string, list: any, selectedFacet: any) {

  let values: any = []

  list[facet].forEach((value: any) => {
    values.push({
      quantity: value.skuIds.length,
      label: value.label,
      isSelected: selectedFacet.value == value.label
    })
  });

  return values
}

function getValuesFiltered(facet: string, list: any, products: any) {

  let knownList: any = []
  let values: any = []

  products.forEach((prod: any) => {
    if (!knownList.includes(prod)) {

      let found = false
      for (let i = 0; i < list[facet].length && found == false; i++) {
        if (list[facet][i].skuIds.includes(prod)) {

          knownList = knownList.concat(list[facet][i].skuIds)

          values.push({
            quantity: list[facet][i].skuIds.length,
            label: list[facet][i].label,
            isSelected: false
          })
          if (facet != "insertionDate") {
            found = true;
          }
        }
      }
    }
  });

  return values
}

function mapDate(list: any) {
  let mappedDateFacet: any = []

  let last14 = { label: "last14", quantity: 0, skuIds: [] }
  let last7 = { label: "last7", quantity: 0, skuIds: [] }

  let currentDate = getLocalDateTime(TimeZone.Rome)


  list.insertionDate.forEach((item: any) => {
    let dbDate = new Date(item.date)

    //month facets
    let month = dbDate.getMonth()

    let found = false
    for (let i = 0; i < mappedDateFacet.length && found == false; i++) {
      if (mappedDateFacet[i].month == month) {
        found = true
        mappedDateFacet[i].skuIds.concat(item.skuIds)
        mappedDateFacet[i].quantity += item.skuIds.length
      }
    }
    if (!found) {
      mappedDateFacet.push({
        month: month,
        label: MONTH_NAMES_IT[month],
        skuIds: item.skuIds,
        quantity: item.skuIds.length,

      })
    }

    let partial = currentDate
    partial.setDate(partial.getDate() - 14);

    if (currentDate >= partial) {
      last14.skuIds = last14.skuIds.concat(item.skuIds)
      last14.quantity += item.skuIds.length
    }

    partial = currentDate
    partial.setDate(partial.getDate() - 7);

    if (currentDate >= partial) {
      last7.skuIds = last7.skuIds.concat(item.skuIds)
      last7.quantity += item.skuIds.length
    }

  });

  if (last14.quantity > 1) {
    mappedDateFacet.push(last14)
  }
  if (last7.quantity > 1) {
    mappedDateFacet.push(last7)
  }

  return mappedDateFacet
}
