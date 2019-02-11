import { Sails } from './sails';
import { SailsModel } from './sails.model';
import { SailsRequest } from './sails.request';
import { SailsModelInterface } from './sails.model.interface';
import { RequestCriteria } from './sails.request.criteria';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SailsResponse } from './sails.response';

export class SailsQuery<T extends SailsModelInterface> {
    private model: T;
    private request: SailsRequest;
    private criteria: RequestCriteria;
    private errorMsg = `[SailsSocketIO]: the data is not an instance of ${this.modelClass.name}.
        You could SailsModel.unserialize(${this.modelClass.name}, data) as ${this.modelClass.name}[] (Array of Models), Or
        SailsModel.unserialize(${this.modelClass.name}, data) as ${this.modelClass.name} (Single Models)
        after fetching the data with SailsRequest.`;

    constructor(sails: Sails, private modelClass: new() => T  ) {
        this.request = new SailsRequest(sails);
        this.model = new modelClass();
    }

    public find(): Observable<T[]> {
        this.request.addParam('where', this.getRequestCriteria());
        return this.request.get(`/${this.model.getEndPoint()}`).pipe(
            map((res: SailsResponse) => {
                if (res.isOk()) {
                    return SailsModel.unserialize<T>(this.modelClass, res.getData()) as T[];
                }
                throw res;
            })
        );
    }

    public findOne(id: string): Observable<T> {
        this.request.addParam('where', this.getRequestCriteria());
        return this.request.get(`/${this.model.getEndPoint()}/${id}`).pipe(
            map((res: SailsResponse) => {
                if (res.isOk()) {
                    return SailsModel.unserialize<T>(this.modelClass, res.getData()) as T;
                }
                throw res;
            })
        );
    }

    public populate<U extends SailsModelInterface>(id: string, association: new() => U = null ): Observable<U[]> {
      const associationModel = new association();
      const assosiationModelClass = association;

      this.request.addParam('where', this.getRequestCriteria());
      return this.request.get(`/${this.model.getEndPoint()}/${id}/${associationModel.getEndPoint()}`).pipe(
        map((res: SailsResponse) => {
          if (res.isOk()) {
            return SailsModel.unserialize<U>(assosiationModelClass, res.getData()) as U[];
          }
          throw res;
        })
      );
    }

    public save(model: T): Observable<T> {
        if (!(model instanceof this.modelClass)) {
            throw new TypeError(this.errorMsg);
        }

        const data = SailsModel.serialize(model);
        const url = `/${model.getEndPoint()}`;
        if (model.id === null || model.id === '') {
            return this.request.post(url, data).pipe(
                map(( res: SailsResponse ) => {
                    if (res.isOk()) {
                        return SailsModel.unserialize<T>(this.modelClass, res.getData()) as T;
                    }
                    throw res;
                })
            );
        } else {
            return this.request.put(url.concat('/', model.id), data).pipe(
                map(( res: SailsResponse ) => {
                    if (res.isOk()) {
                        return SailsModel.unserialize<T>(this.modelClass, res.getData()) as T;
                    }
                    throw res;
                })
            );
        }
    }

    public update(id: string, model: Partial<T>): Observable<T> {
        if (model.createdAt) {
            delete model.createdAt;
        }
        if (model.updatedAt) {
            delete model.updatedAt;
        }
        const data = model instanceof SailsModel ? SailsModel.serialize(model) : Object.assign({}, model);
        return this.request.patch(`/${this.model.getEndPoint()}/${id}`, data).pipe(
            map(( res: SailsResponse ) => {
                if (res.isOk()) {
                    return SailsModel.unserialize<T>(this.modelClass, res.getData()) as T;
                }
                throw res;
            })
        );
    }

    public restore(id: string, model: Partial<T>): Observable<T> {
      if (model.createdAt) {
        delete model.createdAt;
      }
      if (model.updatedAt) {
        delete model.updatedAt;
      }
      const data = model instanceof SailsModel ? SailsModel.serialize(model) : Object.assign({}, model);
      return this.request.patch(`/${this.model.getEndPoint()}/${id}/restore`, data).pipe(
        map(( res: SailsResponse ) => {
          if (res.isOk()) {
            return SailsModel.unserialize<T>(this.modelClass, res.getData()) as T;
          }
          throw res;
        })
      );
    }

    public replace<U extends SailsModelInterface>( id: string, model: Partial<T>, association: new() => U = null ): Observable<T> {
      if (model.createdAt) {
        delete model.createdAt;
      }
      if (model.updatedAt) {
        delete model.updatedAt;
      }
      const associationModel = new association();
      const data = model instanceof SailsModel ? SailsModel.serialize(model) : Object.assign({}, model);
      const endpoint = associationModel.getEndPoint();

      return this.request.put(`/${this.model.getEndPoint()}/${id}/${endpoint}`, data[endpoint]).pipe(
        map(( res: SailsResponse ) => {
          if (res.isOk()) {
            return SailsModel.unserialize<T>(this.modelClass, res.getData()) as T;
          }
          throw res;
        })
      );
    }

    public remove(id: string): Observable<T> {
        return this.request.delete(`/${this.model.getEndPoint()}/${id}`).pipe(
            map(( res: SailsResponse ) => {
                if (res.isOk()) {
                    return SailsModel.unserialize<T>(this.modelClass, res.getData()) as T;
                }
                throw res;
            })
        );
    }

    public setLimit(limit: number  = -1): this {
      if ( limit >= 0) {
        this.request.addParam( 'limit', limit );
      }
      return this;
    }

    public setSort(sort: string = ''): this {
      if ( sort !== '') {
        this.request.addParam('sort', sort);
      }
      return this;
    }

    public setSkip(skip: number = -1): this {
      if ( skip >= 0) {
        this.request.addParam('skip', skip);
      }
      return this;
    }

    public setPopulation(...population: string[]): this {
      if ( population.length > 0 ) {
        this.request.addParam( 'populate', `${population.join( ',' )}` );
      }
      return this;
    }

    public setRequestCriteria(criteria: RequestCriteria = null): this {
        this.criteria = criteria;
        return this;
    }

    private getRequestCriteria(): RequestCriteria {
        return this.criteria || new RequestCriteria();
    }
}