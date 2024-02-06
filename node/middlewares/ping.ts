export async function ping(ctx: Context, next: () => Promise<any>) {
  ctx.status = 200;
  ctx.body = "OK";
  ctx.state.logger.debug(`Ping ${(new Date()).toISOString()} -- ws: ${ctx.vtex.workspace}`);
  console.info(`ping ${Date.now()} -- ws: ${ctx.vtex.workspace}`)
  await next()
}