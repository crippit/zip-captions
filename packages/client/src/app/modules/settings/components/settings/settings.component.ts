import { Component, ElementRef, OnDestroy, OnInit, Renderer2, Signal, WritableSignal, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject, combineLatest, filter, map, startWith, take, takeUntil } from 'rxjs';
import { AppAppearanceState, AppState } from '../../../../models/app.model';
import { selectAppAppearance } from '../../../../selectors/app.selector';
import { languageSelector, selectFontFamily, selectLineHeight, selectRenderHistoryLength, selectTextSize, themeSelector, wakeLockEnabledSelector } from '../../../../selectors/settings.selector';
import { AppTheme, FontFamily, Language, LineHeight, SettingsActions, TextSize, FontFamilyClassMap } from '../../models/settings.model';
import { fadeInOnEnterAnimation, fadeOutOnLeaveAnimation } from 'angular-animations';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  animations: [
    fadeOutOnLeaveAnimation(),
    fadeInOnEnterAnimation()
  ]
})
export class SettingsComponent implements OnInit, OnDestroy {
  public formGroup: FormGroup<{
    theme: FormControl<AppTheme | null>,
    lang: FormControl<Language | null>,
    font: FormControl<FontFamily | null>,
    wakelock: FormControl<boolean | undefined | null>,
    renderHistory: FormControl<number | null>,
    textSize: FormControl<TextSize | null>,
    lineHeight: FormControl<LineHeight | null>,
  }>;
  public acceptedCookies: Signal<boolean | undefined>;
  public classList: WritableSignal<string>;
  public showUnsavedChangesModal?: boolean;
  public modalClosed$: Subject<boolean> = new Subject<boolean>();
  public renderHistory: Signal<number>;
  public renderHistoryFormValue: Signal<number>;
  public fontFamily: Signal<FontFamily>;
  
  private onDestroy$: Subject<void> = new Subject<void>();
  private currentTheme: Signal<AppTheme>;
  private language: Signal<Language>;
  private wakeLockEnabled: Signal<boolean | undefined>;
  private currentTextSize: Signal<TextSize>;
  private currentLineHeight: Signal<LineHeight>;

  constructor(private fb: FormBuilder,
              private store: Store<AppState>,
              private renderer: Renderer2,
              private el: ElementRef,
              private router: Router,
              private translate: TranslateService) {
    this.currentTheme = toSignal(this.store.select(themeSelector)) as Signal<AppTheme>;
    this.language = toSignal(this.store.select(languageSelector)) as Signal<Language>;
    this.wakeLockEnabled = toSignal(this.store.select(wakeLockEnabledSelector));
    this.currentTextSize = toSignal(this.store.select(selectTextSize)) as Signal<TextSize>;
    this.currentLineHeight = toSignal(this.store.select(selectLineHeight)) as Signal<LineHeight>;
    this.renderHistory = toSignal(this.store.select(selectRenderHistoryLength)) as Signal<number>;
    this.fontFamily = toSignal(this.store.select(selectFontFamily)) as Signal<FontFamily>;
    
    this.formGroup = this.fb.group({
      theme: this.fb.control(this.currentTheme()),
      lang: this.fb.control(this.language()),
      font: this.fb.control(this.fontFamily()),
      wakelock: this.fb.control(this.wakeLockEnabled()),
      renderHistory: this.fb.control(this.renderHistory()),
      textSize: this.fb.control(this.currentTextSize()),
      lineHeight: this.fb.control(this.currentLineHeight()),
    });

    this.renderHistoryFormValue = toSignal(this.formGroup.controls['renderHistory'].valueChanges.pipe(
      startWith(this.renderHistory()),
      filter((count) => (count !== null && !isNaN(count)))
    )) as Signal<number>;

    this.acceptedCookies = toSignal(this.store.pipe(
      select(selectAppAppearance),
      map((appearance: AppAppearanceState) => appearance.cookiesAccepted)
    ));

    this.classList = signal(`recognized-text ${this.currentTextSize()} ${this.currentLineHeight()} ${FontFamilyClassMap.get(this.fontFamily())}`)
  }

  ngOnInit(): void {
    this.formGroup.get('theme')?.valueChanges.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((theme) => {
      if (theme) {
        this.renderer.setAttribute(this.el.nativeElement, 'data-theme', theme);
      }
    });
    this.formGroup.get('lang')?.valueChanges.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((lang: Language | null) => {
      if (lang) {
        this.translate.use(lang).subscribe(() => {
          // console.log('used lang', lang)
        })
      }
    });
    const size$ = this.formGroup.get('textSize')!.valueChanges.pipe(startWith(this.currentTextSize()));
    const lineHeight$ = this.formGroup.get('lineHeight')!.valueChanges.pipe(startWith(this.currentLineHeight()));
    const fontFamily$ = this.formGroup.get('font')!.valueChanges.pipe(startWith(this.fontFamily()))
    combineLatest([size$, lineHeight$, fontFamily$])
    .pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(([size, height, font]:[size: TextSize | null, height: LineHeight | null, font: FontFamily | null]) => {
      if (size && height) {
        this._updateClassList(size, height, font);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.formGroup.dirty) {
      this.translate.use(this.language());
    }
    this.onDestroy$.next();
  }

  canDeactivate(): boolean | Observable<boolean> {
    if (this.formGroup.dirty) {
      this.showUnsavedChangesModal = true;
      return this.modalClosed$.asObservable().pipe(take(1));
    }
    return true;
  }

  modalClosed(value: boolean): void {
    this.showUnsavedChangesModal = false;
    this.modalClosed$.next(value);
  }

  saveSettings(): boolean {
    // TODO: Refactor save functionality to write entire settings object
    const theme: AppTheme = this.formGroup.get('theme')!.value as AppTheme;
    this.store.dispatch(SettingsActions.setTheme({theme}));
    
    const language: Language = this.formGroup.get('lang')!.value as Language;
    this.store.dispatch(SettingsActions.setLanguage({language}))
    
    const wakelockEnabled: boolean = this.formGroup.get('wakelock')!.value as boolean;
    this.store.dispatch(SettingsActions.updateWakeLockEnabled({enabled: wakelockEnabled}));
    
    const size: TextSize = this.formGroup.get('textSize')!.value as TextSize;
    this.store.dispatch(SettingsActions.setTextSize({size}));
    
    const height: LineHeight = this.formGroup.get('lineHeight')!.value as LineHeight;
    this.store.dispatch(SettingsActions.setLineHeight({height}));
    
    const count: number = this.formGroup.get('renderHistory')!.value as number;
    this.store.dispatch(SettingsActions.setRenderHistory({count}));
    
    const font: FontFamily = this.formGroup.get('font')!.value as FontFamily;
    this.store.dispatch(SettingsActions.setFontFamily({font}))
    
    this.formGroup.markAsPristine();
    this.router.navigate([''])
    return false;
  }

  private _updateClassList(size: TextSize, height: LineHeight, font: FontFamily | null): void {
    let className = `recognized-text ${size} ${height}`;
    if (font) {
      className += ` ${FontFamilyClassMap.get(font)}`
    }
    this.classList.set(className);
  }
}
