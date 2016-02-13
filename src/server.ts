import express from 'express';
import { server } from './model';
import renderToHTML from 'vdom-to-html';

type Request = { path: string };
type Response = { send: (html: string) => void };

export default function main() {
  const app = express();
  app.use((req: any, res: any, next: any) => {
    console.log('%s %s %s', req.method, req.url, req.path);
    next();
  });
  app.use(express.static(__dirname + '/../dist/'));
  app.use((req: Request, res: Response): void => {
    server(req.path)
      .then(vtree => {
        res.send(renderToHTML(vtree));
      }, error => {
        res.send(error.message);
      });
  });
  app.listen(3000);
}