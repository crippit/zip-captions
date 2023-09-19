import { Component, Signal, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { zoomTokenSelector } from '../../../../selectors/recognition.selector';
import { map } from 'rxjs';
import { AppState } from '../../../../models/app.model';
import { RecognitionActions } from '../../../../models/recognition.model';

@Component({
  selector: 'app-connect-zoom',
  templateUrl: './connect-zoom.component.html',
  styleUrls: ['./connect-zoom.component.scss'],
})
export class ConnectZoomComponent {
  public formGroup: FormGroup;
  public isConnected: Signal<boolean | undefined>
  
  constructor(private fb: FormBuilder,
              private store: Store<AppState>) {

    this.isConnected = toSignal(this.store.pipe(select(zoomTokenSelector), map((tok) => !!tok)))

    effect(() => {
      if (this.isConnected() && this.formGroup.enabled) {
        this.formGroup.disable();
      } else if (!this.isConnected() && this.formGroup.disabled) {
        this.formGroup.enable();
      }
    })

    this.formGroup = this.fb.group({
      apiToken: this.fb.control<string | null>(null, [Validators.required, Validators.pattern(/^https?:\/\/(?:[-\w.]|(?:%[\da-fA-F]{2}))+zoom.us\/(closedcaption)\S+$/i)])
    });
  }

  public saveZoomToken(): void {
    console.log('saveZoomToken');
    this.formGroup.updateValueAndValidity();
    if (this.formGroup.valid) {
      this.store.dispatch(RecognitionActions.saveZoomToken({apiToken: this.formGroup.value.apiToken}))
    } else {
      this.formGroup.markAsTouched();
    }
  }

  public disconnect(): void {
    this.store.dispatch(RecognitionActions.clearZoomToken());
  }
}
