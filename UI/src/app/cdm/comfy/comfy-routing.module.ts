import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ComfyComponent } from './comfy.component';

const routes: Routes = [
  {
    path: '',
    component: ComfyComponent,
    data: { breadcrumb: 'Link Tables' },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComfyRoutingModule {
}
