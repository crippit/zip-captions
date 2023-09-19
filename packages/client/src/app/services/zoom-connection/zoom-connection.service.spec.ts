import { TestBed } from '@angular/core/testing';

import { ZoomConnectionService } from './zoom-connection.service';

describe('ZoomConnectionService', () => {
  let service: ZoomConnectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZoomConnectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
