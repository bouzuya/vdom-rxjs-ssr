import express from 'express';
import renderToHTML from 'vdom-to-html';
import { model } from './model';
import { view } from './view';
import { User } from './user';
import { State } from './state';

export default function main() {
  const app = express();
  app.get('/users/:userId', (req: any, res: any) => {
    const state = model(req.params);
    const vtree = view(state, true);
    const html = renderToHTML(vtree);
    res.send(html);
  });
  app.use(express.static(__dirname + '/../'));
  app.listen(3000);
}