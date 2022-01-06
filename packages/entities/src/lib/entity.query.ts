import { isFunction, isString, isUndefined, select } from '@ngneat/elf';
import { OperatorFunction, pipe } from 'rxjs';
import { map } from 'rxjs/operators';
import { untilEntitiesChanges } from './all.query';
import {
  BaseEntityOptions,
  defaultEntitiesRef,
  DefaultEntitiesRef,
  EntitiesRecord,
  EntitiesRef,
  EntitiesState,
  getEntityType,
  getIdType,
  ItemPredicate,
} from './entity.state';

interface Options extends BaseEntityOptions<any> {
  pluck?: string | ((entity: unknown) => any);
}

/**
 * Observe an entity
 *
 * @example
 *
 * store.pipe(selectEntity(id, { pluck: 'title' })
 *
 * store.pipe(selectEntity(id, { ref: UIEntitiesRef })
 *
 */
export function selectEntity<
  S extends EntitiesState<Ref>,
  K extends keyof getEntityType<S, Ref>,
  Ref extends EntitiesRef = DefaultEntitiesRef
>(
  id: getIdType<S, Ref>,
  options: { pluck: K } & BaseEntityOptions<Ref>
): OperatorFunction<S, getEntityType<S, Ref>[K] | undefined>;

/**
 * Observe an entity
 *
 * @example
 *
 * store.pipe(selectEntity(id, { pluck: e => e.title })
 *
 * store.pipe(selectEntity(id, { ref: UIEntitiesRef })
 *
 */
export function selectEntity<
  S extends EntitiesState<Ref>,
  R,
  Ref extends EntitiesRef = DefaultEntitiesRef
>(
  id: getIdType<S, Ref>,
  options: {
    pluck: (entity: getEntityType<S, Ref>) => R;
  } & BaseEntityOptions<Ref>
): OperatorFunction<S, R | undefined>;

/**
 *
 * Observe an entity
 *
 * @example
 *
 * store.pipe(selectEntity(id))
 *
 * store.pipe(selectEntity(id, { ref: UIEntitiesRef })
 *
 */
export function selectEntity<
  S extends EntitiesState<Ref>,
  Ref extends EntitiesRef = DefaultEntitiesRef
>(
  id: getIdType<S, Ref>,
  options?: BaseEntityOptions<Ref>
): OperatorFunction<S, getEntityType<S, Ref> | undefined>;

export function selectEntity<S extends EntitiesState<Ref>, Ref>(
  id: any,
  options: Options = {}
) {
  const { ref: { entitiesKey } = defaultEntitiesRef, pluck } = options;

  return pipe(
    untilEntitiesChanges(entitiesKey),
    select<S, Ref>((state) => getEntity(state[entitiesKey], id, pluck))
  );
}

export function getEntity(
  entities: EntitiesRecord,
  id: string | number,
  pluck: Options['pluck']
) {
  const entity = entities[id];

  if (isUndefined(entity)) {
    return undefined;
  }

  if (!pluck) {
    return entity;
  }

  if (isString(pluck)) {
    return entity[pluck];
  }

  return pluck(entity);
}

export function selectEntitiesByPredicate<
  S extends EntitiesState<Ref>,
  R extends getEntityType<S, Ref>[],
  K extends keyof getEntityType<S, Ref>,
  Ref extends EntitiesRef = DefaultEntitiesRef
>(
  predicate: ItemPredicate<getEntityType<S, Ref>>,
  options?: {
    pluck: K | ((entity: getEntityType<S, Ref>) => R);
  } & BaseEntityOptions<Ref>
): OperatorFunction<S, getEntityType<S, Ref>[]> {
  const { ref: { entitiesKey } = defaultEntitiesRef, pluck } = options || {};

  return pipe(
    select<S, getEntityType<S, Ref>[]>((state) => state[entitiesKey]),
    map((entities) => {
      const filtered: typeof entities = [];

      Object.values(entities).forEach((entity, index) => {
        const isSelected = predicate(entity, index);

        if (!isSelected || isUndefined(entity)) {
          return;
        }

        if (pluck) {
          if (isFunction(pluck)) {
            filtered.push(pluck(entity));
          } else {
            filtered.push(entity[pluck]);
          }
        } else {
          filtered.push(entity);
        }
      });

      return filtered;
    })
  );
}
