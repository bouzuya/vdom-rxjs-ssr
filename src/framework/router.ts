import pathToRegexp from 'path-to-regexp';
import { Path } from './types';
import { InitializerName, InitializerParameters } from './initializer';

type Route = { path: Path, name: InitializerName };
type RouteResult = { name: InitializerName, params: InitializerParameters };

class Router {
  private config: Route[];

  constructor(routes: Route[]) {
    this.config = routes;
  }

  routes(path: Path): RouteResult {
    const requestPath = path;
    for (var i = 0; i < this.config.length; i++) {
      const route = this.config[i];
      const { path, name } = route;
      const keys: any[] = [];
      const match = pathToRegexp(path, keys).exec(requestPath);
      if (match) {
        const params: InitializerParameters = {};
        for (var j = 1; j < match.length; j++) {
          params[keys[j - 1].name] = match[j];
        }
        return { name, params };
      }
    }
    return null;
  }
}

export { Router, Route, RouteResult };