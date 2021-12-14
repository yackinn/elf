import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterService } from './router.service';

@NgModule({
  imports: [CommonModule],
})
export class ElfNgRouterStoreModule {
  constructor(private routerService: RouterService) {
    routerService.init();
  }
}
