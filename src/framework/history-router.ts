import { Router, RouteResult } from './router';
import { Observable, Subject } from 'rxjs';

class HistoryRouter {
  private router: Router;
  private window: any;
  private history: History;
  private subject: Subject<RouteResult>;

  constructor(router: Router) {
    this.window = Function('return this')();
    this.history = this.window.history;
    this.router = router;
    this.subject = new Subject();
  }

  back(): void {
    if (this.history) {
      this.history.back();
    }
  }

  changes(): Observable<RouteResult> {
    return this.subject.asObservable();
  }

  go(path: string, replace: boolean = false): void {
    if (this.history) {
      const f = replace ? history.replaceState : history.pushState;
      f.apply(history, [null, null, path]);
    }
    this.subject.next(this.router.routes(path));
  }

  start(): void {
    if (this.history) {
      this.window.addEventListener('popstate', () => {
        const path = this.window.location.pathname;
        console.log('back : ' + path);
        this.subject.next(this.router.routes(path));
      }, false);
    }
  }
}

export { HistoryRouter };