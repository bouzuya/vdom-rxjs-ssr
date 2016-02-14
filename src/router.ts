import routes from './configs/routes';
import { Route, Router } from './libs/router';

const makeRouter = <T>(wrap: (routeName: string) => (params: string[]) => T) => {
  return new Router<T>(routes.map(([p, n]): Route<T> => [p, wrap(n)]));
};

export { makeRouter, Router };