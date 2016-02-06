import { diff, patch } from 'virtual-dom';
import parse from 'vdom-parser';
import { initClient } from './model';

type RTree = Element;
type VTree = VirtualDOM.VTree;
type Render = (vtree: VTree) => Render;

const makeRender = (rtree: RTree, vtree: VTree): Render => {
  return (newVTree: VTree): Render => {
    const newRTree = patch(rtree, diff(vtree, newVTree));
    return makeRender(newRTree, newVTree);
  };
};

export default function main() {
  const rootSelector = 'div#app';
  const state = (<any>window).INITIAL_STATE;
  const { emit, on } = initClient(state);
  const rtree = document.querySelector(rootSelector);
  let render = makeRender(rtree, parse(rtree));
  on('vtree-updated', (vtree: VTree) => render = render(vtree));
  setInterval(() => emit('change-name'), 1000);
}