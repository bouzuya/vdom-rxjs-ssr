import pathToRegexp from 'path-to-regexp';

type Route<T> = [string, (params: string[]) => T];

class Router<T> {
  private config: Route<T>[];

  constructor(config: Route<T>[]) {
    this.config = config;
  }

  route(path: string): T {
    for (var i = 0; i < this.config.length; i++) {
      const route = this.config[i];
      const [pathPattern, handler] = route;
      const match = pathToRegexp(pathPattern).exec(path);
      if (match) {
        return handler(match.slice(1));
      }
    }
    return null;
  }
}

export { Route, Router };