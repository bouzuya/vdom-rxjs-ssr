import { diff, patch } from 'virtual-dom';
import parse from 'vdom-parser';

type MyEvent = [EventName, EventListener, [Selector, EventListener][]];
type EventName = string;
type Selector = string;
type RTree = Element;
type VTree = VirtualDOM.VTree;

// https://developer.mozilla.org/ja/docs/Web/API/Element/matches
const matchElement = (element: Element, selector: string) => {
  const prototype: any = Element.prototype;
  const matches = prototype.matches ||
    prototype.webkitMatchesSelector ||
    prototype.msMatchesSelector ||
    prototype.oMatchesSelector;
  if (!matches) throw new Error('Element.prototype.matches is not implemented');
  return matches.call(element, selector);
};

const matchEvent = (event: Event, selector: string): boolean => {
  let target = <Element> event.target;
  while (target) {
    if (matchElement(target, selector)) return true;
    target = target.parentElement;
  }
  return false;
};

class DOM {
  private rtree: RTree;
  private vtree: VTree;
  private events: MyEvent[];

  constructor(rootSelector: string) {
    this.rtree = document.querySelector(rootSelector);
    this.vtree = parse(this.rtree);
    this.events = [];
  }

  on(
    selector: string,
    eventName: string,
    listener: (event: Event) => void
  ): void {
    const oldEvent = this.events.filter(([i]) => i === eventName)[0];
    const oldSelectors = oldEvent ? oldEvent[2] : [];
    const newSelectors = oldSelectors.concat([[selector, listener]]);
    const newEventListener = (event: Event): void => {
      newSelectors.forEach(([selector, listener]) => {
        if (matchEvent(event, selector)) listener(event);
      });
    };
    this.events = this.events.filter(([i]) => i !== eventName).concat([[
      eventName,
      newEventListener,
      newSelectors
    ]]);
    this.attachEvents();
    if (oldEvent) this.detachEvent(oldEvent);
  }

  render(vtree: VTree): void {
    const current = this.vtree;
    const next = vtree;
    this.rtree = patch(this.rtree, diff(current, next));
    this.vtree = next;
    this.attachEvents();
  }

  private attachEvents(): void {
    this.events.forEach(([eventName, listener]) => {
      this.rtree.removeEventListener(eventName, listener, false);
      this.rtree.addEventListener(eventName, listener, false);
    });
  }

  private detachEvent([eventName, listener]: MyEvent): void {
    this.rtree.removeEventListener(eventName, listener, false);
  }
}

export { DOM, VTree };