import { Router } from '../libs/router';

class HistoryRouter<T> {
  private router: Router<T>;
  private window: any;
  private history: History;

  constructor(router: Router<T>) {
    this.window = Function('return this')();
    this.history = this.window.history;
    this.router = router;
  }

  back(): void {
    if (this.history) {
      this.history.back();
    }
  }

  go(path: string, replace: boolean = false): T {
    if (this.history) {
      const f = replace ? history.replaceState : history.pushState;
      f.apply(history, [null, null, path]);
    }
    return this.router.route(path);
  }

  start(): void {
    if (this.history) {
      this.window.addEventListener('popstate', () => {
        const path = this.window.location.pathname;
        return this.router.route(path);
      }, false);
    }
  }
}

export { HistoryRouter };