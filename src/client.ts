import { diff, patch } from 'virtual-dom';
import parse from 'vdom-parser';
import { view } from './view';
import { State } from './state';

type RTree = Element;
type VTree = VirtualDOM.VTree;
type Render = (state: State) => Render;
type Updater = () => Updater;

const loop = (f: any) => {
  setTimeout(() => loop(f()), 1000);
};

const makeRender = (rtree: RTree, vtree: VTree): Render => {
  return (state: State): Render => {
    const newVTree = view(state, false);
    const newRTree = patch(rtree, diff(vtree, newVTree));
    return makeRender(newRTree, newVTree);
  };
};

const makeUpdater = (state: State, render: Render): Updater => {
  return () => {
    const newState = update(state);
    const newRender = render(newState);
    return makeUpdater(newState, newRender);
  };
};

const update = (state: State): State => {
  const { user } = state;
  const { name } = user;
  const newUser = Object.assign({}, user, { name: name + '!' });
  const newState = Object.assign({}, state, { user: newUser });
  return newState;
};

export default function main() {
  const rootSelector = 'div#app';
  const state = (<any>window).INITIAL_STATE;
  const rtree = document.querySelector(rootSelector);
  const render = makeRender(rtree, parse(rtree))(state);
  loop(makeUpdater(state, render));
}