import express from 'express';
import { Server } from './server';
import { VTree } from './view';

type Request = { path: string };
type Response = { send: (html: string) => void };

export default function main(
  server: { request: (path: string) => Promise<VTree> }
) {
  const app = express();
  app.use((req: any, res: any, next: any) => {
    console.log('%s %s %s', req.method, req.url, req.path);
    next();
  });
  app.use(express.static(__dirname + '/../../dist/'));
  app.use((req: Request, res: Response): void => {
    server
      .request(req.path)
      .then(html => {
        res.send(html);
      }, error => {
        res.send(error.message);
      });
  });
  app.listen(3000);
}