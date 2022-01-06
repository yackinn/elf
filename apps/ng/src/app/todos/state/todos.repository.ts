import { Injectable } from '@angular/core';
import { createState, select, Store, withProps } from '@ngneat/elf';
import {
  addEntities,
  selectAll,
  selectAllApply,
  selectEntity,
  updateEntities,
  withEntities,
} from '@ngneat/elf-entities';
import { switchMap } from 'rxjs/operators';
import { selectEntitiesByPredicate } from '../../../../../../packages/entities/src/lib/entity.query';
import { write } from '../../store/mutations';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export interface TodosProps {
  filter: 'ALL' | 'ACTIVE' | 'COMPLETED';
}

const { state, config } = createState(
  withEntities<Todo>(),
  withProps<TodosProps>({ filter: 'ALL' })
);

const store = new Store({ name: 'todos', state, config });

@Injectable({ providedIn: 'root' })
export class TodosRepository {
  todos$ = store.pipe(selectAll());
  filter$ = store.pipe(select((state) => state.entities));

  visibleTodos$ = this.filter$.pipe(
    switchMap((filter) => {
      return store.pipe(
        selectAllApply({
          // filterEntity({ completed }) {
          //   if (filter === 'ALL') return true;
          //   return filter === 'COMPLETED' ? completed : !completed;
          // },
        })
      );
    })
  );

  selectByTitle(title: Todo['title']) {
    return store.pipe(
      selectEntitiesByPredicate((entity) => entity.title === title)
      // selectEntity(1, {pluck: ""})
    );
  }

  addTodo(title: Todo['title']) {
    store.update(addEntities({ id: Math.random(), title, completed: false }));
  }

  updateFilter(filter: TodosProps['filter']) {
    store.update(
      write((state) => {
        state.filter = filter;
      })
    );
  }

  updateCompleted(id: Todo['id']) {
    store.update(
      updateEntities(id, (entity) => ({
        ...entity,
        completed: !entity.completed,
      }))
    );
  }
}
