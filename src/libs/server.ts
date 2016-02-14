import express from 'express';
import renderToHTML from 'vdom-to-html';

type Request = { path: string };
type Response = { send: (html: string) => void };
type ServerResponse = {
  render: (path: string) => Promise<VirtualDOM.VTree>;
};

export default function main(server: () => ServerResponse) {
  const app = express();
  const { render } = server();
  app.use((req: any, res: any, next: any) => {
    console.log('%s %s %s', req.method, req.url, req.path);
    next();
  });
  app.use(express.static(__dirname + '/../../dist/'));
  app.use((req: Request, res: Response): void => {
    render(req.path)
      .then(renderToHTML)
      .then(html => {
        res.send(html);
      }, error => {
        res.send(error.message);
      });
  });
  app.listen(3000);
}