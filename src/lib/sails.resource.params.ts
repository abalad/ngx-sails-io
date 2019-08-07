import { RequestCriteria } from './sails.request.criteria';

export class ResourceFindParams<T> {
  filter?: RequestCriteria = null;
  subCriteria?: RequestCriteria = null;
  limit?: number;
  skip?: number;
  sort?: string;
  population?: string[];
  select?: string;
  omit?: string;
}

export class ResourceFindOneParams<T> {
  population?: string[];
  select?: string;
  omit?: string;
}

export class ResourceCreateParams<T> {
    population?: string[];
}
