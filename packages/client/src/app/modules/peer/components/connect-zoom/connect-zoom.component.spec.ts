import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConnectZoomComponent } from './connect-zoom.component';
import { TestingModuleImports, TestingModuleProviders } from '../../../../../testing/test-scaffold';

describe('ConnectZoomComponent', () => {
  let component: ConnectZoomComponent;
  let fixture: ComponentFixture<ConnectZoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: TestingModuleImports,
      declarations: [ConnectZoomComponent],
      providers: TestingModuleProviders
    }).compileComponents();

    fixture = TestBed.createComponent(ConnectZoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
