import { EventEmitter } from 'events';
import { Route, Router } from '../libs/router';

type ListenerProxy = (...args: any[]) => void;

type ClientResponse = {
  on: (eventName: string, options?: any) => void;
  rootSelector: string;
  events: [string, string, ListenerProxy][];
  router: Router<void>;
};

type ServerResponse = {
  render: (path: string) => Promise<VirtualDOM.VTree>;
};

const makeRouter = <T>(routes: any, wrap: (routeName: string) => (params: string[]) => T) => {
  return new Router<T>(routes.map(([p, n]): Route<T> => [p, wrap(n)]));
};

const makeClient = (
  routes: any, view: any, initEvents: any, domEvents: any, rootSelector: any
): (state: any) => ClientResponse => {
  return (state: any): ClientResponse => {
    const emitter = new EventEmitter();
    const emit = emitter.emit.bind(emitter);
    const on = emitter.on.bind(emitter);
    const eventActions = initEvents(emit, state);
    Object.keys(eventActions).forEach(eventName => {
      on(eventName, eventActions[eventName]);
    });
    on('state-updated', (state: any): void => {
      emit('vtree-updated', view(state, false));
    });
    const makeListenerProxy = (eventName: string): ListenerProxy => {
      return (...args: any[]): void => {
        emit.apply(null, [eventName].concat(args));
      };
    };
    const eventsConverted: [string, string, ListenerProxy][] = domEvents
      .map(([selector, eventName, routeName]) =>
        [selector, eventName, makeListenerProxy(routeName)]
      );
    const router = makeRouter<void>(
      routes,
      (routeName: string) => makeListenerProxy(routeName)
    );
    return { events: eventsConverted, on, rootSelector, router };
  };
};

const makeServer = (
  routes: any, view: any, initRoutes: any, initialState: any
): () => ServerResponse => {
  return (): ServerResponse => {
    const routeActions = initRoutes();
    const router = makeRouter<any>(
      routes,
      (routeName: string) => routeActions[routeName]
    );
    const render = (path: string) => {
      return Promise
        .resolve(initialState)
        .then(router.route(path))
        .then(state => view(state, true));
    };
    return { render };
  };
};

export { makeClient, makeServer };
