import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSubcategoriesComponent } from './user-subcategories.component';

describe('UserSubcategoriesComponent', () => {
  let component: UserSubcategoriesComponent;
  let fixture: ComponentFixture<UserSubcategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSubcategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserSubcategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
