import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserWorkoutComponent } from './user-workout.component';

describe('UserWorkoutComponent', () => {
  let component: UserWorkoutComponent;
  let fixture: ComponentFixture<UserWorkoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserWorkoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserWorkoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
