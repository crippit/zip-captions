import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ZoomTokenStateComponent } from './zoom-token-state.component';

describe('ZoomTokenStateComponent', () => {
  let component: ZoomTokenStateComponent;
  let fixture: ComponentFixture<ZoomTokenStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ZoomTokenStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ZoomTokenStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
