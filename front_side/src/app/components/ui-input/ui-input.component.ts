import { Component, OnInit, Input, EventEmitter, Output, SimpleChange, ChangeDetectorRef } from '@angular/core';
import { FormControl} from '@angular/forms';

@Component({
  selector: 'ui-input',
  templateUrl: './ui-input.component.html',
  styleUrls: ['./ui-input.component.scss'],
})
export class UiInputComponent implements OnInit {

  constructor(private cdr: ChangeDetectorRef) { }

  @Input('formControl')
  formControl: FormControl = new FormControl('');

  @Input('placeholder')
  placeholder: string = '';

  @Input('type')
  type: string = 'text';

  @Output('onModelChange') 
  onModelChange = new EventEmitter();

  @Input('ngModel') 
  sharedVar: string = '';

  ngOnInit(): void {

  }

  onModelChanges($event) {
    this.sharedVar = $event;
    this.formControl.setValue($event);
    this.onModelChange.emit($event);
    this.cdr.detectChanges();
  }

}
