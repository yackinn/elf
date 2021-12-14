import { Component } from '@angular/core';
import { RouterRepository } from '../../../../packages/ng-router-store/src/lib/router.repository';

@Component({
  selector: 'elf-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ng';

  constructor(private routerRepository: RouterRepository) {
    routerRepository.selectNavigationError().subscribe((error) => {
      console.log('test', error);
    });
  }
}
