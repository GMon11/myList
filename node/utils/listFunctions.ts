import { MONTH_NAMES_IT, TimeZone } from "./constants";
import { getLocalDateTime } from "./functions";

export function getProductsList(selectedFacets: any, list: any) {

  let products: any = []

  if (selectedFacets.length > 0) {


    selectedFacets.forEach((facet: any) => {

      let fProducts: any = []

      //aggiungere check sulla validità della key

      if (facet.key == "insertionDate") {

        fProducts = getDateFilteredProducts(facet, list)

      } else {
        fProducts = getFilteredProducts(facet, list)
      }


      if (fProducts && fProducts.length > 0) {
        products.push(fProducts)
      }
      if (products.length > 1) {
        products = products[0].filter((x: any) => products[1].includes(x))
      }
    });

    products = (Array.isArray(products[0])) ? products[0] : products

  } else {
    products = list[0].skuIds;
  }

  return products;
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

export function getDateFilteredProducts(facet: any, list: any) {

  console.log("facet:", facet)


  let products: any = []

  let currentDate = getLocalDateTime(TimeZone.Rome)

  if (MONTH_NAMES_IT.includes(facet.value)) {
    let month = MONTH_NAMES_IT.indexOf(facet.value)

    console.log("month:", month)

    list[0].insertionDate.forEach((item: any) => {
      let dbMonth = new Date(item.date).getMonth()
      if (month == dbMonth) {

        products = item.skuIds

        console.log("item.skuIds:", item.skuIds)

      }
    });
  } else if (facet.value == "last14") {


    list[0].insertionDate.forEach((item: any) => {

      let dbDate = new Date(item.date);

      let partial = new Date(currentDate);
      partial.setDate(partial.getDate() - 14);

      if (dbDate >= partial) {
        products = item.skuIds
      }

    });


  } else if (facet.value == "last7") {
    list[0].insertionDate.forEach((item: any) => {

      let dbDate = new Date(item.date);

      let partial = new Date(currentDate);
      partial.setDate(partial.getDate() - 7);

      if (dbDate >= partial) {
        products = item.skuIds
      }

    });
  }

  console.log("products:", products)

  return products

}
