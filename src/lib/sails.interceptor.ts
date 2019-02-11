import { SailsResponse } from './sails.response';
import { SailsRequestOptions } from './sails.request.options';
import { SailsInterceptorHandlerInterface } from './sails.interceptor.handler';
import { Observable } from 'rxjs';

export type SailsInterceptorConstructor = new(...args: any[]) => any;

export interface SailsInterceptorInterface {
    /**
     * @returns Observable<SailsResponse>
     */
    intercept(request: SailsRequestOptions, next: SailsInterceptorHandlerInterface): Observable<SailsResponse>;
}
