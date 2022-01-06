import { Component } from '@angular/core';
import { TodosRepository } from './state/todos.repository';

@Component({
  selector: 'elf-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.css'],
})
export class TodosComponent {
  constructor(public todosRepo: TodosRepository) {
    todosRepo
      .selectByTitle('test')
      .subscribe((result) => console.log('result', result));
  }
}
