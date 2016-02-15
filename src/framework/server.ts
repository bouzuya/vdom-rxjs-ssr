import renderToHTML from 'vdom-to-html';
import { Router, Route, RouteResult } from './router';
import { HTML, Path } from './types';
import { Initializer } from './initializer';
import run from './express-server';
import { VTree } from './view';

class Server<State> {
  private initializers: { [actionName: string]: Initializer<State> };
  private render: (state: State) => VTree;
  private router: Router;

  constructor(
    initializers: { [actionName: string]: Initializer<State> },
    render: (state: State) => VTree,
    routes: Route[]
  ) {
    this.initializers = initializers;
    this.render = render;
    this.router = new Router(routes);
  }

  run(): void {
    // FIXME:
    run(<any> this);
  }

  private init(path: Path): Promise<State> {
    const result = this.router.routes(path);
    const initializer = this.initializers[result.name];
    return initializer(result.params);
  }

  private request(path: Path): Promise<HTML> {
    return this.init(path)
      .then(state => this.render(state))
      .then(vtree => renderToHTML(vtree));
  }
}

export { Server };