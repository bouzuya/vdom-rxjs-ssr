import { diff, patch, VTree, RTree } from './view';
import parse from 'vdom-parser';
import { Observable, Subject, Subscription } from 'rxjs';

type MyEvent = [EventName, EventListener, [Selector, EventListener][]];
type EventName = string;
type Selector = string;

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
  private events: {
    eventName: string;
    selector: string;
    subject: Subject<Event>;
    subscription?: Subscription;
  }[];

  constructor(rootSelector: string) {
    this.rtree = document.querySelector(rootSelector);
    this.vtree = parse(this.rtree);
    this.events = [];
  }

  on(
    selector: string,
    eventName: string
  ): Observable<Event> {
    const subject = new Subject();;
    this.events.push({ eventName, selector, subject });
    this.attachEvents();
    return subject.asObservable();
  }

  renderToDOM(vtree: VTree): void {
    const current = this.vtree;
    const next = vtree;
    this.rtree = patch(this.rtree, diff(current, next));
    this.vtree = next;
    this.attachEvents();
  }

  private attachEvents(): void {
    this.events = this.events
      .map(({ eventName, selector, subject, subscription }) => {
        if (subscription) subscription.unsubscribe();
        return {
          eventName, selector, subject,
          subscription: Observable
            .fromEvent<Event>(this.rtree, eventName)
            .filter(event => matchEvent(event, selector))
            .subscribe(event => subject.next(event))
        };
      });
  }
}

export { DOM };