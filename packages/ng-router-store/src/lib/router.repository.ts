import { Injectable } from '@angular/core';
import { createState, select, Store, withProps } from '@ngneat/elf';
import { combineLatest, distinctUntilChanged, Observable, pluck } from 'rxjs';
import { RouterStateService } from './router-state.service';
import { HashMap } from './util.types';
import { slice } from './utils';

export type ActiveRouteState = {
  url: string;
  urlAfterRedirects: string;
  fragment: string | null;
  params: HashMap<any>;
  queryParams: HashMap<any>;
  data: HashMap<any>;
  navigationExtras: HashMap<any> | undefined;
};

export type RouterState = {
  state: ActiveRouteState | null;
  navigationId: number | null;
};

const { state, config } = createState(
  withProps<RouterState>({
    state: null,
    navigationId: null,
  })
);

const store = new Store({ state, name: 'router', config });

@Injectable({ providedIn: 'root' })
export class RouterRepository {
  constructor(private routerStateService: RouterStateService) {}

  select<R>(cb: (state: RouterState) => R): Observable<R> {
    return store.pipe(select(cb));
  }

  selectNavigationError() {
    return this.routerStateService.navigationError.asObservable();
  }

  selectNavigationCancel() {
    return this.routerStateService.navigationCancel.asObservable();
  }

  selectParams<T extends keyof ActiveRouteState['params']>(
    names: T[]
  ): Observable<ActiveRouteState['params'][T][]>;
  selectParams<T extends keyof ActiveRouteState['params']>(
    names?: T
  ): Observable<ActiveRouteState['params'][T]>;
  selectParams<T extends keyof ActiveRouteState['params']>(
    names?: T | T[]
  ): Observable<
    ActiveRouteState['params'][T] | ActiveRouteState['params'][T][] | null
  > {
    // todo is this useful?
    if (names === undefined) {
      return store.pipe(
        select((state) => state?.state && Object.values(state.state.params))
      );
    }

    const _select = (p: T) =>
      store.pipe(slice<RouterState>('params'), pluck(p));

    if (Array.isArray(names)) {
      const sources = names.map(_select);
      return combineLatest(sources);
    }

    return _select(names).pipe(distinctUntilChanged());
  }

  update(update: Partial<RouterState>) {
    store.update((state) => ({ ...state, ...update }));
  }
}
