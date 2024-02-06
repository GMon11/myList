import { stringify } from "../utils/functions";

export async function createCronJob(ctx: Context | any, next: () => Promise<any>) {
  try {
    let res = await ctx.clients.Cron.createCronJobIfNotExist();
    res ? ctx.state.logger.info(`cron job created on ws ${ctx.vtex.workspace}`) : ctx.state.logger.info(`cron job already exists on ws ${ctx.vtex.workspace}`);
  } catch (err) {
    ctx.state.logger.error(err.msg ?? stringify(err));
  }
  await next()
}