import { IOClients } from '@vtex/api';
import Cron from './Cron';
import OrderFormClient from './OrderForm';
import Vtex from './Vtex';

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {

  public get Vtex() {
    return this.getOrSet("Vtex", Vtex);
  }

  public get OrderForm() {
    return this.getOrSet("OrderFormClient", OrderFormClient);
  }


  public get Cron() {
    return this.getOrSet("Cron", Cron);
  }
}
