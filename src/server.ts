import express from 'express';
import { initBy } from './model';
import renderToHTML from 'vdom-to-html';

type Request = { path: string };
type Response = { send: (html: string) => void };

export default function main() {
  const app = express();
  app.use(express.static(__dirname + '/../dist/'));
  app.use((req: Request, res: Response): void => {
    initBy(req.path)
      .then(vtree => {
        res.send(renderToHTML(vtree));
      }, error => {
        res.send(error.message);
      });
  });
  app.listen(3000);
}