import { Observable } from 'rxjs';
import { DOM } from './dom';
import { VTree } from './view';

type App<T> = (x: { state: T }) => Observable<T>;

class Client<State> {
  private rootSelector: string;
  private render: (state: State) => VTree;
  private app: App<State>;

  constructor(
    rootSelector: string,
    render: (state: State) => VTree,
    app: App<State>
  ) {
    this.rootSelector = rootSelector;
    this.render = render;
    this.app = app;
  }

  run(): void {
    const dom = new DOM(this.rootSelector);
    const state: State = (<any> window).INITIAL_STATE;
    const state$ = this.app({ state });
    state$
      .map(this.render)
      .subscribe(vtree => dom.renderToDOM(vtree));
  }
}

export { Client };
