import { nanoid } from 'nanoid';
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


//return a date with a delay in hours passed by parameter
export function getHoursDelayedDate(hoursDelay: number) {
  let date = new Date();
  date.setHours(date.getHours() + hoursDelay);
  let isoDate = date.toISOString().split("T")[0]
  return isoDate
}


