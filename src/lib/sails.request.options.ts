import { SailsIOClient } from './sails.io.client';

export interface SailsRequestOptionsInterface {
    url?: string;
    method?: string;
    params?: object;
    headers?: Map<string, string>;
}

export class SailsRequestOptions {
    private readonly options: SailsRequestOptionsInterface;

    constructor({ url, method, params, headers }: SailsIOClient.RequestOptions) {
        this.options = { url, method, params: params, headers: this.toMap(headers) };
    }

    clone(options: SailsRequestOptionsInterface): this {
        // Strip out undefined values
        for (const name in options) {
            // @ts-ignore
          if (!this.options.hasOwnProperty(name) || !options[name]) {
                // @ts-ignore
            delete options[name];
            }
        }

        Object.assign(this.options, options);
        return this;
    }

    private toMap(obj: { [key: string]: any } = {}) {
        const map = new Map;
        Object.keys(obj).forEach(k => (map.set(k, obj[k])));
        return map;
    }

    private toObject(map: Map<string, string> = new Map) {
        const obj = {};
        // @ts-ignore
      map.forEach((v, k) => (obj[k] = v));
        return obj;
    }

    get method(): string | undefined {
        return this.options.method;
    }

    get url(): string | undefined {
        return this.options.url;
    }

    get params(): object | undefined {
        return this.options.params;
    }

    get headers(): Map<string, string> | undefined {
        return this.options.headers;
    }

    serialize(): SailsIOClient.RequestOptions {
        return {
            url: this.url,
            method: this.method,
            params: this.params,
            headers: this.toObject(this.headers)
        };
    }
}
