import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedUiModule } from 'shared-ui';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ThemeSelectorComponent } from './components/theme-selector/theme-selector.component';
import { routes } from './settings.routes';



@NgModule({
  declarations: [
    SettingsComponent,
    ThemeSelectorComponent,
    LanguageSelectorComponent,
  ],
  imports: [
    CommonModule,
    SharedUiModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    SettingsComponent,
    ThemeSelectorComponent,
    LanguageSelectorComponent
  ]
})
export class SettingsModule { }
