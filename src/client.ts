import { client } from './model';
import { DOM, VTree } from './libs/dom';

export default function main() {
  const state = (<any>window).INITIAL_STATE;
  const { emit, on, events, rootSelector } = client(state);
  const dom = new DOM(rootSelector);
  events.forEach(([selector, eventName, listener]) => {
    dom.on(selector, eventName, listener);
  });
  on('vtree-updated', (vtree: VTree) => dom.render(vtree));
}
