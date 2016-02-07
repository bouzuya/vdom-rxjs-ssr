import { diff, patch } from 'virtual-dom';
import parse from 'vdom-parser';
import { init } from './model';

type RTree = Element;
type VTree = VirtualDOM.VTree;
type Render = (vtree: VTree) => Render;
type Emitter = (eventName: string, options?: any) => void;

const attachEvent = (
  rtree: RTree, eventName: string, listener: EventListener
): void => {
  rtree.removeEventListener(eventName, listener, false);
  rtree.addEventListener(eventName, listener, false);
};

const buildEventListeners = (
  events: [string, string, string[]][],
  emit: Emitter
): [string, EventListener][] => {
  const eventsObject: { [eventName: string]: [string, string[]][] } = {};
  events.forEach(([eventName, selector, emitArgs]) => {
    const obj = eventsObject[eventName];
    const newObj = (obj ? obj : []).concat([[selector, emitArgs]]);
    eventsObject[eventName] = newObj;
  });
  return Object
    .keys(eventsObject)
    .map<[string, [string, string[]][]]>((key) => [key, eventsObject[key]])
    .map<[string, EventListener]>(([eventName, selectors]) => {
      const listener = (event: Event) => {
        selectors.forEach(([selector, emitArgs]) => {
          const match = matchEvent(event, selector);
          if (match) emit.apply(null, (<any[]> emitArgs).concat([event]));
        })
      };
      return [eventName, listener];
    });
};

const makeAttachEvents = (
  events: [string, string, string[]][],
  emit: Emitter
) => {
  const eventListeners = buildEventListeners(events, emit);
  return (rtree: RTree): void => {
    eventListeners.forEach(([eventName, listener]) => {
      attachEvent(rtree, eventName, listener);
    });
  };
};

const makeRender = (rtree: RTree, vtree: VTree, after: any): Render => {
  return (newVTree: VTree): Render => {
    const newRTree = patch(rtree, diff(vtree, newVTree));
    after(newRTree);
    return makeRender(newRTree, newVTree, after);
  };
};

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

export default function main() {
  const state = (<any>window).INITIAL_STATE;
  const { emit, on, events, rootSelector } = init(state);
  const rtree = document.querySelector(rootSelector);
  let render = makeRender(rtree, parse(rtree), makeAttachEvents(events, emit));
  render = render(state); // initial render (attach event)
  on('vtree-updated', (vtree: VTree) => render = render(vtree));
}