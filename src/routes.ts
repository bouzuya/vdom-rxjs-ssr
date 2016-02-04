import pathToRegexp from 'path-to-regexp';

type Route = [string, (params: string[]) => any];

const routes = (routes: Route[], path: string): any => {
  for (var i = 0; i < routes.length; i++) {
    const route = routes[i];
    const [pathPattern, handler] = route;
    const match = pathToRegexp(pathPattern).exec(path);
    if (match) {
      return handler(match.slice(1));
    }
  }
  return null;
};

export { routes };