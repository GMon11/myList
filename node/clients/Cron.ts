import { APP, ExternalClient, InstanceOptions, IOContext } from "@vtex/api";
import { CRON_JOB_EXPRESSION } from "../utils/constants";
import { stringify } from "../utils/functions";
import { CreateCronJobReq, CronJobItemRes } from "../typings/cron";

export default class Cron extends ExternalClient {

  private pingUrl: string;
  private pingMethod: string;

  //@ts-ignore
  constructor(context: IOContext, options?: InstanceOptions) {
    options!.headers = { ...options?.headers, ...{ VtexIdclientAutCookie: context.authToken } }
    super(`http://${context.account}.vtexcommercestable.com.br`, context, options);
    this.pingUrl = `https://${this.context.workspace}--${this.context.account}.myvtex.com/_v/private/app/fareye/ping`;
    this.pingMethod = `POST`;
  }

  private getCronJobs = async (): Promise<CronJobItemRes[]> => {
    return new Promise<CronJobItemRes[]>((resolve, reject) => {
      this.http.get(
        `/api/scheduler/${this.context.workspace}/${APP.NAME}?version=4`,
        this.options
      )
        .then(res => resolve(res))
        .catch(err => reject({ msg: `Error while retrieving cron jobs --details: ${stringify(err)}` }))
    })
  }

  private createCronJob = async (): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      let body: CreateCronJobReq = {
        request: {
          uri: this.pingUrl,
          method: this.pingMethod,
          headers: {},
          body: {}
        },
        scheduler: {
          endDate: new Date(new Date().getFullYear() + 3, 0, 1, 1).toISOString(),
          expression: CRON_JOB_EXPRESSION
        },
        retry: {
          delay: {
            addMinutes: 1,
            addHours: 0,
            addDays: 0
          },
          times: 3,
          backOffRate: 1.0
        }
      }
      this.http.post(
        `/api/scheduler/${this.context.workspace}/${APP.NAME}?version=4`,
        body,
        this.options
      )
        .then(res => resolve(res))
        .catch(err => reject({ msg: `Error while creating cron job --details: ${stringify(err)}` }))
    })
  }

  public createCronJobIfNotExist = async (): Promise<any> => {
    return new Promise<any>(async (resolve, reject) => {
      try {
        let jobs = await this.getCronJobs();
        let job = jobs.find(j => j.app == APP.NAME && j.request.uri == this.pingUrl && j.request.method == this.pingMethod && j.endDate > new Date().toISOString());
        if (!job) {
          await this.createCronJob();
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (err) {
        reject(err);
      }
    })
  }
}
