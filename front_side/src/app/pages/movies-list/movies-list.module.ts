import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UiInputModule } from 'src/app/components/ui-input';
import { MoviesListComponent } from './movies-list.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    MoviesListComponent
  ],
  exports: [
    MoviesListComponent
  ],
  imports: [
    UiInputModule,
    CommonModule
  ]
})
export class MoviesListModule { }
