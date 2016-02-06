import express from 'express';
import { init } from './model';

type Request = { path: string };
type Response = { send: (html: string) => void };
type ServerRequestHandler = (req: Request, res: Response) => void;

const makeServerRequestHandler = (): ServerRequestHandler => {
  const emit = init();
  return (req: Request, res: Response): void => {
    const eventName = 'request';
    const eventOptions = {
      path: req.path,
      done: (html: string): void => res.send(html)
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