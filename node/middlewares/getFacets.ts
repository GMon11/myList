import { SelectedFacets } from "../typings/config";
import { ListRecord } from "../typings/md_entities";
import { Facet, FacetValue, GetFacets_Response } from "../typings/types";
import { LIST_ENTITY, LIST_FIELDS, MONTH_NAMES_IT, TimeZone } from "../utils/constants";
import { getLocalDateTime } from "../utils/functions";
import { getProductsList } from "../utils/listFunctions";


export async function getFacets(ctx: Context, next: () => Promise<any>) {

  try {

    let list: ListRecord[] = await ctx.clients.Vtex.searchDocumentV2(LIST_ENTITY, LIST_FIELDS, `listId=${ctx.state.request.listId}`)

    if (list[0].existent == false) {
      throw new Error("#notExistentList")
    }

    let facets: Facet[] = []

    let products: string[] = getProductsList(ctx.state.request.selectedFacets!, list[0])

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

    let response: GetFacets_Response = {
      data: {
        facets: facets
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

function getAllValues(facet: string, list: any, selectedFacet: SelectedFacets) {

  let values: FacetValue[] = []

  list[facet].forEach((value: any) => {
    values.push({
      quantity: value.skuIds.length,
      label: value.label,
      value: value.value,
      selected: selectedFacet.value == value.value
    })
  });

  return values
}

function getValuesFiltered(facetKey: string, list: any, products: string[]) {

  let knownList: string[] = []
  let values: FacetValue[] = []

  products.forEach((prod: string) => {
    if (!knownList.includes(prod)) {

      let found = false
      for (let i = 0; i < list[facetKey]?.length && found == false; i++) {
        if (list[facetKey][i].skuIds.includes(prod)) {

          knownList = knownList.concat(list[facetKey][i].skuIds)

          values.push({
            quantity: list[facetKey][i].skuIds.length,
            label: list[facetKey][i].label,
            value: list[facetKey][i].value,
            selected: false
          })
          if (facetKey != "insertionDate") {
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

  let last14 = { label: "Ultimi 14 giorni", value: "last14", quantity: 0, skuIds: [] }
  let last7 = { label: "Ultimi 7 giorni", value: "last7", quantity: 0, skuIds: [] }

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
        value: MONTH_NAMES_IT[month].toLowerCase(),
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
