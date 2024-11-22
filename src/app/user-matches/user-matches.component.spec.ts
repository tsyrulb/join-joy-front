import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMatchesComponent } from './user-matches.component';

describe('UserMatchesComponent', () => {
  let component: UserMatchesComponent;
  let fixture: ComponentFixture<UserMatchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMatchesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserMatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
