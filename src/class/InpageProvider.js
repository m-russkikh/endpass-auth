import { get } from 'lodash';
import Emmiter from './Emmiter';
import { INPAGE_EVENTS, INPAGE_ID_PREFIX } from '../constants';

export default class InpageProvider {
  constructor(eventEmitter) {
    if (!(eventEmitter instanceof Emmiter)) {
      throw new Error('Event emitter is not provided');
    }

    this.eventEmitter = eventEmitter;
    this.pendingRequestsHandlers = {};
    this.settings = {
      activeAccount: null,
      activeNet: null,
    };
    this.isMetaMask = true;
    this.isConnected = () => true;
    this.enable = this.enable.bind(this);

    this.setupEventsHandlers();
  }

  static createInpageIdFromRequestId(id) {
    return `${INPAGE_ID_PREFIX}${id}`;
  }

  static restoreRequestIdFromInpageId(id) {
    return parseInt(id.replace(INPAGE_ID_PREFIX, ''), 10);
  }

  setupEventsHandlers() {
    this.eventEmitter.on(
      INPAGE_EVENTS.SETTINGS,
      this.handleSettings.bind(this),
    );
    this.eventEmitter.on(
      INPAGE_EVENTS.RESPONSE,
      this.handleResponse.bind(this),
    );
  }

  handleResponse({ error, id, result, jsonrpc }) {
    const requestId = InpageProvider.restoreRequestIdFromInpageId(id);
    const requestHandler = get(this.pendingRequestsHandlers, requestId);

    if (requestHandler) {
      requestHandler(error, {
        id: parseInt(requestId, 10),
        result,
        jsonrpc,
      });

      delete this.pendingRequestsHandlers[requestId];
    }
  }

  handleSettings(payload) {
    const { activeAccount, activeNet } = payload;

    if (activeAccount) {
      this.settings.activeAccount = activeAccount;
    }

    if (activeNet) {
      this.settings.activeNet = activeNet;
    }
  }

  processPayload(payload) {
    let result = null;

    switch (payload.method) {
      case 'eth_accounts':
        result = this.settings.activeAccount
          ? [this.settings.activeAccount]
          : [];
        break;
      case 'eth_coinbase':
        result = this.settings.activeAccount || null;
        break;
      case 'eth_uninstallFilter':
        this.sendAsync(payload, () => {});
        result = true;
        break;
      case 'net_version':
        result = this.settings.activeNet || null;
        break;
      default:
        break;
    }

    return {
      id: payload.id,
      jsonrpc: payload.jsonrpc,
      result,
    };
  }

  sendAsync(payload, callback) {
    const processedPayload = this.processPayload({ ...payload });

    if (processedPayload.result !== null) {
      callback(null, processedPayload);
    } else {
      this.pendingRequestsHandlers[payload.id] = callback;
      this.eventEmitter.emit(INPAGE_EVENTS.REQUEST, {
        ...payload,
        id: InpageProvider.createInpageIdFromRequestId(payload.id),
      });
    }
  }

  send(payload) {
    return this.processPayload(payload);
  }

  async enable() {
    return this.processPayload({ method: 'eth_accounts' }).result;
  }
}
