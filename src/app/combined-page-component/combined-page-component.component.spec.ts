import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CombinedPageComponentComponent } from './combined-page-component.component';

describe('CombinedPageComponentComponent', () => {
  let component: CombinedPageComponentComponent;
  let fixture: ComponentFixture<CombinedPageComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CombinedPageComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CombinedPageComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
