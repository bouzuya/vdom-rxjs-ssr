import pathToRegexp from 'path-to-regexp';

type Route<T> = [string, (params: string[]) => T];

class Router<T> {
  private config: Route<T>[];
  private window: any;
  private history: History;

  constructor(config: Route<T>[]) {
    this.window = Function('return this')();
    this.history = this.window.history;
    this.config = config;
  }

  back(): void {
    if (this.history) {
      this.history.back();
    }
  }

  go(path: string, replace: boolean = false): T {
    if (this.history) {
      const f = replace ? history.replaceState : history.pushState;
      f.apply(history, [null, null, path]);
    }
    return this.routes(this.config, path);
  }

  start(): void {
    if (this.history) {
      this.window.addEventListener('popstate', () => {
        const path = this.window.location.pathname;
        return this.routes(this.config, path);
      }, false);
    }
  }

  private routes(routes: Route<T>[], path: string): T {
    for (var i = 0; i < routes.length; i++) {
      const route = routes[i];
      const [pathPattern, handler] = route;
      const match = pathToRegexp(pathPattern).exec(path);
      if (match) {
        return handler(match.slice(1));
      }
    }
    return null;
  }
}

export { Router };