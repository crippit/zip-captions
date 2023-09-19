import { Component, WritableSignal, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../models/app.model';

@Component({
  selector: 'app-connect-zoom',
  templateUrl: './connect-zoom.component.html',
  styleUrls: ['./connect-zoom.component.scss'],
})
export class ConnectZoomComponent {
  public formGroup: FormGroup;
  public isConnected: WritableSignal<boolean> = signal(false);

  // public error: Signal<string | undefined>;
  
  constructor(private fb: FormBuilder,
              private store: Store<AppState>) {

    this.formGroup = this.fb.group({
      apiToken: this.fb.control<string | null>(null, [Validators.required])
    });
  }

  public saveZoomToken(): void {
    console.log('saveZoomToken');
    this.formGroup.updateValueAndValidity();
    if (this.formGroup.valid) {
      this.formGroup.disable();
      this.isConnected.set(true);
    } else {
      this.formGroup.markAsTouched();
    }
  }

  public disconnect(): void {
    this.formGroup.enable();
    this.isConnected.set(false);
  }
}
