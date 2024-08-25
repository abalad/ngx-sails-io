import { Property, unserialize } from './sails.serialize';
import { SailsModelInterface } from './sails.model.interface';
import { Endpoint } from './sails.decorator.endpoint';
import { isObject } from './utils';

@Endpoint()
export abstract class SailsModel implements Partial<SailsModelInterface> {
    @Property() id ?: string = null;
    @Property({ type: Date }) createdAt?: Date;
    @Property({ type: Date }) updatedAt?: Date;

    static serialize<U extends SailsModelInterface>(model: U): U {
        const recr = (obj: {} & U) => {
            for (const key in obj) {
              if (obj.hasOwnProperty(key)) {
                // @ts-ignore
                const prop: U = obj[key];
                // Ignore NULL values
                if (prop === null || typeof prop === 'function') {
                    delete obj[key];
                }

                // Convert Property Models to their ID representations
                if (prop && prop instanceof SailsModel && prop.id !== null) {
                    // @ts-ignore
                  obj[key] = prop.id;
                }

                if (prop && prop instanceof SailsModel) {
                    // @ts-ignore
                  obj[key] = SailsModel.serialize(prop);
                }

                if (prop && prop instanceof Array) {
                  // @ts-ignore
                  obj[key] = prop.map(ob => {
                      if (ob instanceof SailsModel) {
                          return SailsModel.serialize(ob);
                      }

                      return ob;
                  });
                }
              }
            }
            return obj;
        };
        return recr(Object.assign({}, model));
    }

    // @ts-ignore
  static unserialize<U extends SailsModelInterface>(modelClazz, data: U | U[]): U | U[] {
        const callFn = (model: U) => unserialize<U>(modelClazz, model) as U;
        if (Array.isArray(data)) {
            return data.map(callFn);
        } else if (isObject(data)) {
            return callFn(data);
        }
        throw new Error('SailsModel.unserialize requires a data parameter of either a Literal Object or an Array of Literal Objects');
    }

    getEndPoint?(): string {
      return this.getEndPoint();
    }

}
