import { diff, patch, VTree } from './view';
import parse from 'vdom-parser';

type MyEvent = [EventName, EventListener, [Selector, EventListener][]];
type EventName = string;
type Selector = string;

class DOM {
  private rtree: RTree;
  private vtree: VTree;
  private events: MyEvent[];

  constructor(rootSelector: string) {
    this.rtree = document.querySelector(rootSelector);
    this.vtree = parse(this.rtree);
    this.events = [];
  }

  renderToDOM(vtree: VTree): void {
    const current = this.vtree;
    const next = vtree;
    this.rtree = patch(this.rtree, diff(current, next));
    this.vtree = next;
  }
}

export { DOM };