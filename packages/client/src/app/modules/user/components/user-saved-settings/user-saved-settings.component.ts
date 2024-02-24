import { Component, Signal, ViewEncapsulation, computed, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../models/app.model';
import { selectUserId, selectUserSavedSettings } from '../../../../selectors/user.selector';
import { SettingsActions, SettingsState } from '../../../settings/models/settings.model';
import { selectAppSettings } from '../../../../selectors/settings.selector';
import { UserActions } from '../../../../actions/user.actions';

@Component({
  selector: 'app-user-saved-settings',
  templateUrl: './user-saved-settings.component.html',
  styleUrls: ['./user-saved-settings.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserSavedSettingsComponent {

  public savedUiSettings: Signal<SettingsState | undefined>;
  public currentUiSettings: Signal<SettingsState>;
  public settingsMatch: Signal<boolean>;
  public viewingSaved: boolean;
  constructor(private store: Store<AppState>) {
    
    this.viewingSaved = false;

    this.savedUiSettings = toSignal(this.store.select(selectUserSavedSettings));
    this.currentUiSettings = toSignal(this.store.select(selectAppSettings)) as Signal<SettingsState>;
    const userId = toSignal(this.store.select(selectUserId))
    effect(() => {
      if (userId()) {
        this.store.dispatch(UserActions.getSettings())
      }
    }, { allowSignalWrites: true})
    
    this.settingsMatch = computed(() => {
      const saved = this.savedUiSettings();
      const current = this.currentUiSettings();
      if (saved && current) {
        console.log('comparing objects', saved)
        return Object.keys(saved).length === Object.keys(current).length &&
        (Object.keys(saved) as (keyof SettingsState)[]).every((key) => 
          (key in current && saved[key] == current[key])
        )
      }
      return false;
    })
    
  }

  applySaved(): void {
    console.log('apply saved')
    const settings = this.savedUiSettings();
    if (settings) {
      this.store.dispatch(SettingsActions.applySettings({ settings }))
    } else {
      console.error('no saved settings to apply');
    }
  }

  saveCurrent(): void {
    this.store.dispatch(UserActions.saveSettingsState({ settings: this.currentUiSettings() }))
  }

  toggleView(): void {
    this.viewingSaved = !this.viewingSaved;
  }
  
}
