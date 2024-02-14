import {
  ClientsConfig,
  LRUCache,
  RecorderState,
  Service,
  ServiceContext,
  method
} from '@vtex/api';

import { Clients } from './clients';
import { checkRequest } from './middlewares/checkRequest';
import { createCronJob } from './middlewares/createCronJob';
import { createList } from './middlewares/createList';
import { getProducts } from './middlewares/getProducts';
import { initLogger } from './middlewares/initLogger';
import { ping } from './middlewares/ping';
import { removeProducts } from './middlewares/removeProducts';
import { AppSettings, SelectedFacets } from './typings/config';
import { CustomLogger } from './utils/Logger';
import { getFacets } from './middlewares/getFacets';


//import { antiThrottler } from './middlewares/antiThrottler';

const TIMEOUT_MS = 10 * 3000;

// Create a LRU memory cache for the Status client.
// The @vtex/api HttpClient respects Cache-Control headers and uses the provided cache.
const memoryCache = new LRUCache<string, any>({ max: 5000, maxSize: 5000, ttl: 1000 * 60 * 120 });
metrics.trackCache('status', memoryCache);
export var requests: any = {};

// This is the configuration for clients available in `ctx.clients`.
const clients: ClientsConfig<Clients> = {
  // We pass our custom implementation of the clients bag, containing the Status client.
  implementation: Clients,
  options: {
    // All IO Clients will be initialized with these options, unless otherwise specified.
    default: {
      retries: 5,
      timeout: TIMEOUT_MS,
      memoryCache
    },
  },
};

declare global {
  type Context = ServiceContext<Clients, State>


  // The shape of our State object found in `ctx.state`. This is used as state bag to communicate between middleware.
  interface State extends RecorderState {
    appSettings: AppSettings
    logger: CustomLogger
    request: {
      skuId?: string,
      listId?: string,
      selectedFacets?: SelectedFacets[],
      first?: number,
      after?: string
    }
  }
}

// Export a service that defines route handlers and client options.
export default new Service({
  clients,
  events: {
    onAppInstalled: [initLogger, createCronJob]
  },
  routes: {
    // antiThrottler disabled because in case the BE api returns 504, FE is not able to call BE anymore due to not updated internal state (FE keeps on receiving 429)
    ping: method({
      POST: [initLogger, ping]
    }),
    createList: method({
      POST: [checkRequest, createList]
    }),
    getFacets: method({
      POST: [getFacets]
    }),
    getProducts: method({
      POST: [getProducts]
    }),
    removeProducts: method({
      DELETE: [removeProducts]
    })

  }
})
