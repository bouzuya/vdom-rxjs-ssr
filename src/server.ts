import express from 'express';
import { init } from './model';
import renderToHTML from 'vdom-to-html';

type Request = { path: string };
type Response = { send: (html: string) => void };
type ServerRequestHandler = (req: Request, res: Response) => void;
type Done = (error: Error, vtree?: any) => void;

const makeDone = (response: Response): Done => {
  return (error: Error, vtree?: any): void => {
    if (error) {
      response.send(error.message);
    } else {
      response.send(renderToHTML(vtree));
    }
  };
};

const makeServerRequestHandler = (): ServerRequestHandler => {
  const emit = init();
  return (req: Request, res: Response): void => {
    const eventName = 'request';
    const eventOptions = {
      path: req.path,
      done: makeDone(res)
    };
    emit(eventName, eventOptions);
  };
};

export default function main() {
  const app = express();
  app.use(express.static(__dirname + '/../dist/'));
  app.use(makeServerRequestHandler());
  app.listen(3000);
}