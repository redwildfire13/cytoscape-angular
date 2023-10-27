import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ValidatorFn,
} from '@angular/forms';
import { FormInfo } from './form-info';

@Component({
  selector: 'cyng-fluid-form',
  templateUrl: `./fluid-form.component.html`,
  styleUrls: [`./fluid-form.component.scss`],
})
export class FluidFormComponent
  implements OnInit, OnChanges, AfterViewInit, AfterViewChecked
{
  @Input()
  model: object | undefined;
  @Output()
  modelChange: EventEmitter<object> = new EventEmitter<object>();

  @Input()
  modelProperty: string | undefined;
  @Input()
  formInfo!: FormInfo;

  formGroup!: FormGroup;

  constructor() {}

  ngOnInit(): void {
    console.debug(
      'FluidFormComponent this.formInfo:',
      JSON.stringify(this.formInfo)
    );
    let controls = {};
    this.formInfo?.fieldsets.forEach((fieldsetInfo) => {
      fieldsetInfo.fieldInfos.forEach((fieldInfo) => {
        if (!this.model || !fieldInfo || !fieldInfo.modelProperty) {
          return;
        }
        let modelValue = this.model[fieldInfo.modelProperty];
        // console.log('fieldInfo.modelProperty:', fieldInfo.modelProperty, ', modelValue:', modelValue)
        const validators: ValidatorFn[] =
          typeof fieldInfo.validators === 'function'
            ? fieldInfo.validators()
            : fieldInfo.validators;
        const asyncValidators: AsyncValidatorFn[] =
          typeof fieldInfo.asyncValidators === 'function'
            ? fieldInfo.asyncValidators()
            : fieldInfo.asyncValidators;
        const { updateOn } = fieldInfo;
        let formControl = new FormControl(modelValue, {
          validators,
          asyncValidators,
          updateOn,
        });
        formControl.valueChanges.subscribe((change) => {
          if (!this.model || !fieldInfo || !fieldInfo.modelProperty) {
            return;
          }
          console.debug(
            'form control change ',
            JSON.stringify(change),
            ' for prop ',
            fieldInfo.modelProperty,
            ', changing current model value ',
            this.model[fieldInfo.modelProperty],
            ' to ',
            change
          );
          fieldInfo.setValue(change, this.model, this.modelChange);
        });
        controls[fieldInfo.modelProperty] = formControl;
      });
    });
    this.formGroup = new FormGroup(controls);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.debug('ngOnChanges fluid-form changes:', JSON.stringify(changes));
    if (changes['model']) {
      const model = changes['model'].currentValue;
      for (let key of Object.keys(model)) {
        console.debug('ngOnChanges model key copying to form:', key);
        const control = this.formGroup?.controls[key];
        control
          ? control.setValue(model[key], { emitEvent: false })
          : console.warn('no control for model key ', key);
      }
    }
  }

  ngAfterViewInit(): void {
    // console.debug("ngAfterViewInit")
  }

  ngAfterViewChecked(): void {
    // console.debug("ngAfterViewChecked")
  }

  onSubmit() {
    console.log(`Form submitted`);
  }
}
