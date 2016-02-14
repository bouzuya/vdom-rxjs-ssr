import { DOM, VTree } from '../libs/dom';
import { HistoryRouter } from '../libs/history-router';

export default function main(client: any) {
  const state = (<any>window).INITIAL_STATE;
  const { on, events, rootSelector, router } = client(state);
  const dom = new DOM(rootSelector);
  events.forEach(([selector, eventName, listener]) => {
    dom.on(selector, eventName, listener);
  });
  on('vtree-updated', (vtree: VTree) => dom.render(vtree));
  const history = new HistoryRouter<void>(router);
  on('go', history.go.bind(history));
  history.start();
}
