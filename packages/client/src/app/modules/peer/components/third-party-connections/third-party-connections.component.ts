import { Component, ElementRef, EventEmitter, Output, Renderer2, Signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../models/app.model';
import { ObsConnectionState } from '../../../../reducers/obs.reducer';
import { selectObsConnected } from '../../../../selectors/obs.selectors';
import { map } from 'rxjs';

@Component({
  selector: 'app-third-party-connections',
  templateUrl: './third-party-connections.component.html',
  styleUrls: ['./third-party-connections.component.scss'],
})
export class ThirdPartyConnectionsComponent {

  @Output() openStateChanged: EventEmitter<boolean> = new EventEmitter<boolean>(false);
  @ViewChild('checkbox', {static: true}) checkbox!: ElementRef<HTMLInputElement>;
  public obsConnected: Signal<boolean | undefined>;
  
  constructor(private store: Store<AppState>,
              private renderer: Renderer2) {
    this.obsConnected = toSignal(this.store.pipe(select(selectObsConnected), map((conn) => conn === ObsConnectionState.connected)));
  }

  toggle(): void {
    const newState = this.checkbox.nativeElement.checked ? false : true
    if (newState) {
      this.renderer.setAttribute(this.checkbox.nativeElement, 'checked', 'true');
    } else {
      this.renderer.removeAttribute(this.checkbox.nativeElement, 'checked');
    }
    this.openStateChanged.emit(newState);
  }
}
