import fetch from 'node-fetch';

export interface FetchableGlobal extends Global {
  fetch: unknown;
}
declare const global: FetchableGlobal;
global.fetch = fetch;
