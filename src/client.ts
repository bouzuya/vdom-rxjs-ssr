import { init } from './model';
import { DOM, VTree } from './dom';

export default function main() {
  const state = (<any>window).INITIAL_STATE;
  const { emit, on, events, rootSelector } = init(state);
  const dom = new DOM(rootSelector);
  events.forEach(([eventName, selector, emitArgs]) => {
    dom.on(selector, eventName, (event: Event) => {
      emit.apply(null, (<any[]>emitArgs).concat([event]));
    });
  });
  on('vtree-updated', (vtree: VTree) => dom.render(vtree));
}
