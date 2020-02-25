import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { UiInputComponent } from './ui-input.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    UiInputComponent
  ],
  exports: [ 
    UiInputComponent 
  ],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class UiInputModule { }
