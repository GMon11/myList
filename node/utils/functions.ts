import { Specification } from "../typings/config";
import { ItemOF } from "../typings/orderForm";
import { ConstructionType, SkuContext } from "../typings/types";
import { CONSTRUCTION_TYPE } from "./constants";
import { nanoid } from 'nanoid'
export async function wait(time: number = 500): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  })
}

export const getRandomId = () => nanoid()

export function isValid(field: any): Boolean {
  return field != undefined && field != null && field != "null" && field != "undefined" && field != " " && field != "" && field != !"-" && field != "_" &&
    (
      typeof field != 'object' ||
      (typeof field == 'object' && field.length == undefined) ||
      typeof field == 'object' && field.length > 0
    );
}

export function getRandomReference(): string {
  return (Math.floor(Math.random() * Date.now()) + "").substring(0, 200);
}

export const getCircularReplacer = () => {
  const seen = new WeakSet();
  return ({ }, value: any) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
}

export function stringify(data: any): string {
  return typeof data == "object" ? JSON.stringify(data, getCircularReplacer()) == "{}" ? data : JSON.stringify(data, getCircularReplacer()) : data;
}

export function routeToLabel(ctx: Context | OrderEvent): string {
  let label = "Unknown event: ";
  if (isValid(ctx.vtex.eventInfo?.sender)) {
    label = `Booking status update / New order event (orderId: ${(ctx as OrderEvent).body.orderId}):`;
  } else {
    switch (ctx.vtex.route.id) {
      case "getDeliverySlots":
        label = `Retrieve delivery slots (orderFormId: ${ctx.vtex.route.params.orderFormId}):`;
        break;
      case "reserveDeliverySlot":
        label = `Reserve delivery slot (orderFormId: ${ctx.vtex.route.params.orderFormId}):`;
        break;
      case "cancellationBatch":
        label = `Batch cancellation:`;
        break;
      case "getReservation":
        label = `Retrieve reservationCode (orderId: ${ctx.vtex.route.params.orderId}):`;
        break;
      case "setMPBookingStatus":
        label = `Notification from seller (event: booking-status-update):`;
        break;
      case "checkBookingStatus":
        label = `Check booking status (orderFormId: ${ctx.vtex.route.params.orderFormId}):`;
        break;
      /* backup APIs */
      case "cancelBooking":
        label = `Cancel booking (orderId: ${ctx.vtex.route.params.orderId}):`
        break;
      case "bookingStatusBackUp":
        label = `Booking status update (orderId: ${ctx.vtex.route.params.orderId}):`;
        break;
      case "getReservationInfo":
        label = `Fetch reservation info from vbase:`;
        break;
    }
  }
  return label;
}

//return a date with a delay in hours passed by parameter
export function getHoursDelayedDate(hoursDelay: number) {
  let date = new Date();
  date.setHours(date.getHours() + hoursDelay);
  let isoDate = date.toISOString().split("T")[0]
  return isoDate
}

//return a date with a delay in days passed by parameter
export function getDaysDelayedDate(dayDelay: number) {
  let date = new Date();
  date.setDate(date.getDate() + dayDelay)
  let isoDate = date.toISOString().split("T")[0]
  return isoDate
}

//return true if the product passed (sku) is a gas, instead false
export function isGasProduct(sku: SkuContext, gasSpecs: Specification[]): boolean {
  let found = false;
  for (let index = 0; (index < gasSpecs.length && !found); index++) {
    if (sku.ProductSpecifications.find(f => f.FieldName.toLowerCase() == gasSpecs[index].Name.toLowerCase() && f.FieldValues[0]?.toLowerCase() == gasSpecs[index].Value.toLowerCase())) {
      found = true;
    }
  }
  return found
}

export function checkOrderItems(ctx: Context) {
  let res = {
    ignore: false,
    hasCGasAppliances: false,
    hasPresales: false
  };
  let servicesIds = ctx.state.appSettings.Vtex_Settings.Admin.InstallationServiceIds.split(",");
  for (let index = 0; (index < ctx.state.orderForm.items.length); index++) {
    let sku = ctx.state.skus.find(f => f.Id.toString() == ctx.state.orderForm.items[index].id);
    let hasInstallation = ctx.state.orderForm.items[index].bundleItems?.find(b => servicesIds.includes(b.additionalInfo.offeringTypeId));
    let isBuiltIn = sku?.ProductSpecifications.find(f => (f.FieldName.toLowerCase() == CONSTRUCTION_TYPE.toLowerCase() && f.FieldValues[0]?.toLowerCase() == ConstructionType.BUILTIN.toLowerCase()));
    let isGas = isGasProduct(sku!, ctx.state.appSettings.Vtex_Settings.Admin.GasSpecs);
    let isPresale = isPresaleProduct(ctx.state.orderForm.items[index]);
    if (hasInstallation && isBuiltIn && isGas) {
      res.ignore = true;
      res.hasCGasAppliances = true;
    }
    if (isPresale) {
      res.ignore = true;
      res.hasPresales = true;
    }
  }
  return res
}

//return true if the product (sku), is SideBySide
export function isSideBySide(ctx: Context, sku: SkuContext) {
  let found = false;
  let sideBySide_Specs = ctx.state.appSettings.Vtex_Settings.Admin.SideBySide_Specs;
  for (let index = 0; (index < sideBySide_Specs.length && !found); index++) {
    if (sku.ProductSpecifications.find(f => f.FieldName.toLowerCase() == sideBySide_Specs[index].Name.toLowerCase() &&
      f.FieldValues[0]?.toLowerCase() == sideBySide_Specs[index].Value.toLowerCase())) {
      found = true;
    }
  }
  return found
}

function isPresaleProduct(item: ItemOF) {
  let found = false;
  if (isValid(item.preSaleDate)) {
    let currentDate = new Date().toISOString();
    if (currentDate < item.preSaleDate!) {
      found = true;
    }
  }
  return found
}
