import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

import { ResourceFindOneParams, ResourceFindParams } from './sails.resource.params';
import { SailsModelInterface } from './sails.model.interface';
import { Sails } from './sails';
import { SailsQuery } from './sails.query';
import { SailsModel } from './sails.model';
import { SailsSubscription } from './sails.subscription';
import { SailsEvent } from './sails.event';
import { SailsIOClient } from './sails.io.client';
import ResponseMeta = SailsIOClient.ResponseMeta;

export class SailsResource<T extends SailsModelInterface> {

  public limit = 100;

  public sort = '';

  public skip = 0;

  public population: Array<string> = [];

  public filter = null;

  constructor( public sails: Sails, public modelClass: new() => T) {}

  find( params: ResourceFindParams<T> = new ResourceFindParams<T>(), meta = false ): Observable<T[] | ResponseMeta<T[]>> {
    return new SailsQuery<T>(this.sails, this.modelClass )
      .setRequestCriteria( params.filter || this.filter )
      .setLimit( params.limit || this.limit )
      .setSkip( params.skip || this.skip )
      .setPopulation( ...params.population || this.population )
      .setSort( params.sort || this.sort )
      .find( meta );
  }

  findOne(entity: T | string, params: ResourceFindOneParams<T> = new ResourceFindOneParams<T>()) {
    return new SailsQuery<T>(this.sails, this.modelClass)
      .setPopulation( ...params.population || this.population )
      .findOne( ( entity as T).id || entity as string );
  }

  create(entity: T, params: ResourceFindOneParams<T> = new ResourceFindOneParams<T>()): Observable<T> {
    return new SailsQuery<T>(this.sails, this.modelClass )
      .setPopulation( ...params.population || this.population )
      .create( SailsModel.unserialize(this.modelClass, entity) as T );
  }

  add<U extends SailsModelInterface>(entity: T, entityFK: T,
                                     params: ResourceFindOneParams<T> = new ResourceFindOneParams<T>(),
                                     association: new() => U = null): Observable<T> {
    return new SailsQuery<T>(this.sails, this.modelClass)
        .setPopulation( ...params.population || this.population )
        .add( entity.id, entityFK.id, association );
  }

  update(entity: T, params: ResourceFindOneParams<T> = new ResourceFindOneParams<T>()): Observable<T> {
    return new SailsQuery<T>(this.sails, this.modelClass)
      .setPopulation( ...params.population || this.population )
      .update( entity.id, entity );
  }

  replace<U extends SailsModelInterface>(entity: T, association: new() => U = null): Observable<T> {
    return new SailsQuery<T>(this.sails, this.modelClass)
        .replace( entity.id, entity, association );
  }

  destroy( entity: T ) {
    return new SailsQuery<T>(this.sails, this.modelClass).destroy( entity.id );
  }

  populate<U extends SailsModelInterface>(entity: T, assosiation: new() => U ): Observable<U[]> {
    return new SailsQuery<T>( this.sails,  this.modelClass  )
      .populate( entity.id, assosiation );
  }

  remove<U extends SailsModelInterface>(entity: T, entityfk: U, association: new() => U = null): Observable<any> {
    return new SailsQuery<T>(this.sails, this.modelClass).remove( entity.id, entityfk.id, association );
  }

  restore(entity: T): Observable<any> {
    return new SailsQuery<T>(this.sails, this.modelClass).restore( entity.id, entity );
  }

  onCreated(): Observable<any> {
    return (new SailsSubscription(this.sails)).on( this.getEventName() ).pipe(
      filter( ( event: SailsEvent )  => event.isCreated() ),
      map( ( event: SailsEvent ) => event.getData() )
    );
  }

  onRemoved(): Observable<any> {
    return (new SailsSubscription(this.sails)).on( this.getEventName() ).pipe(
      filter( ( event: SailsEvent ) => event.isRemoved() ),
      map( ( event: SailsEvent ) => event.getData() )
    );
  }

  onUpdated(): Observable<any> {
    return (new SailsSubscription(this.sails)).on( this.getEventName() ).pipe(
      filter( ( event: SailsEvent )  => event.isUpdated() ),
      map( ( event: SailsEvent ) => event.getData() )
    );
  }

  onDestroyed(): Observable<any> {
    return (new SailsSubscription(this.sails)).on( this.getEventName() ).pipe(
        filter( ( event: SailsEvent ) => event.isDestroyed() ),
        map( ( event: SailsEvent ) => event.getPrevious() )
    );
  }

  private getEventName() {
    return ( new this.modelClass() ).getEndPoint();
  }
}
