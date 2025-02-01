import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Subject } from 'rxjs';
import { UserWorkout, WorkoutChartComponent } from './workout-chart.component';
import { WorkoutService } from '../../services/workout.service';

// Register Chart.js components
Chart.register(...registerables);

/**
 * Fake WorkoutService that exposes a workouts$ observable.
 */
class FakeWorkoutService {
  workouts$ = new Subject<any[]>();
}

describe('WorkoutChartComponent', () => {
  let component: WorkoutChartComponent;
  let fixture: ComponentFixture<WorkoutChartComponent>;
  let fakeWorkoutService: FakeWorkoutService;

  beforeEach(async () => {
    fakeWorkoutService = new FakeWorkoutService();

    await TestBed.configureTestingModule({
      declarations: [WorkoutChartComponent],
      providers: [{ provide: WorkoutService, useValue: fakeWorkoutService }]
    })
      // Override the template to include a canvas element with the expected ID.
      .overrideTemplate(WorkoutChartComponent, `
        <div>
          <canvas id="userWorkoutChart"></canvas>
        </div>
      `)
      .compileComponents();

    fixture = TestBed.createComponent(WorkoutChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should transform workout data and auto-select first user on subscription', fakeAsync(() => {
    const data = [
      { userName: 'Alice', workoutType: 'Running', workoutMinutes: 30 },
      { userName: 'Alice', workoutType: 'Cycling', workoutMinutes: 45 },
      { userName: 'Bob', workoutType: 'Swimming', workoutMinutes: 60 }
    ];
    // Emit data from the fake service.
    fakeWorkoutService.workouts$.next(data);
    // Flush setTimeout in createChartForUser.
    tick();
    fixture.detectChanges();

    // There should be two aggregated user entries.
    expect(component.allWorkouts.length).toBe(2);
    const aliceWorkout = component.allWorkouts.find(u => u.name === 'Alice');
    const bobWorkout = component.allWorkouts.find(u => u.name === 'Bob');
    expect(aliceWorkout).toBeDefined();
    if (aliceWorkout) {
      expect(aliceWorkout.totalMinutes).toBe(75);
    }
    expect(aliceWorkout?.totalMinutes).toBe(75);
    expect(bobWorkout).toBeDefined();
    expect(bobWorkout?.totalMinutes).toBe(60);

    // Auto-selection: since autoSelected was false, the first user (Alice) is automatically selected.
    expect(component.selectedUser).toEqual(aliceWorkout!);
    // A chart instance should have been created.
    expect(component.userChart).toBeTruthy();
  }));

  it('should update selectedUser and call createChartForUser when selectUser is invoked', fakeAsync(() => {
    const dummyUser = { name: 'Charlie', workouts: ['Yoga'], totalMinutes: 50 };
    spyOn(component, 'createChartForUser');
    component.selectUser(dummyUser);
    tick();
    expect(component.selectedUser).toEqual(dummyUser);
    expect(component.createChartForUser).toHaveBeenCalledWith('Charlie');
  }));

  it('should destroy existing chart before creating a new one in createChartForUser', fakeAsync(() => {
    // Create a fake chart with a spy on destroy.
    const fakeChart = { destroy: jasmine.createSpy('destroy') };
    component.userChart = fakeChart as unknown as Chart;

    // Provide raw workouts so that the chart creation code runs.
    component.rawWorkouts = [
      { userName: 'David', workoutType: 'Boxing', workoutMinutes: 40 }
    ];
    component.createChartForUser('David');
    tick();
    expect(fakeChart.destroy).toHaveBeenCalled();
    expect(component.userChart).toBeTruthy();
  }));

  it('should log an error if the canvas element is not found in createChartForUser', fakeAsync(() => {
    spyOn(console, 'error');
    // Force document.getElementById to return null.
    spyOn(document, 'getElementById').and.returnValue(null);
    component.createChartForUser('Eve');
    tick();
    expect(console.error).toHaveBeenCalledWith('Canvas element not found!');
  }));

  it('should update the chart if selectedUser still exists in new workout data', fakeAsync(() => {
    // Set selectedUser.
    const dummyUser = { name: 'Frank', workouts: ['Running'], totalMinutes: 30 };
    component.selectedUser = dummyUser;
    spyOn(component, 'createChartForUser');
    // Emit new data that still includes Frank.
    const data = [
      { userName: 'Frank', workoutType: 'Running', workoutMinutes: 30 },
      { userName: 'Grace', workoutType: 'Yoga', workoutMinutes: 20 }
    ];
    fakeWorkoutService.workouts$.next(data);
    tick();
    expect(component.allWorkouts.find(u => u.name === 'Frank')).toBeDefined();
    expect(component.createChartForUser).toHaveBeenCalledWith('Frank');
  }));

  it('should select the first user if the previously selected user no longer exists in new data', fakeAsync(() => {
    // Set selectedUser to a user not present in the new data.
    const dummyUser = { name: 'Henry', workouts: ['Dancing'], totalMinutes: 40 };
    component.selectedUser = dummyUser;
    // Emit new data without Henry.
    const data = [
      { userName: 'Ivy', workoutType: 'Pilates', workoutMinutes: 50 }
    ];
    spyOn(component, 'selectUser').and.callThrough();
    fakeWorkoutService.workouts$.next(data);
    tick();
    // Henry should no longer be in the aggregated workouts.
    expect(component.allWorkouts.find(u => u.name === 'Henry')).toBeUndefined();
    // The component should have auto-selected Ivy.
    expect(component.selectUser).toHaveBeenCalledWith(component.allWorkouts[0]);
  }));

  it('should auto-select the first user only once', fakeAsync(() => {
    const data1 = [
      { userName: 'Jack', workoutType: 'Running', workoutMinutes: 20 }
    ];
    fakeWorkoutService.workouts$.next(data1);
    tick();
    fixture.detectChanges();
    const firstSelected = component.selectedUser;
    expect(firstSelected?.name).toBe('Jack');

    // Now emit new data; since autoSelected is true and a selectedUser exists,
    // the component should not auto-select again.
    spyOn(component, 'selectUser');
    const data2 = [
      { userName: 'Jack', workoutType: 'Running', workoutMinutes: 20 },
      { userName: 'Kate', workoutType: 'Swimming', workoutMinutes: 30 }
    ];
    fakeWorkoutService.workouts$.next(data2);
    tick();
    expect(component.selectUser).not.toHaveBeenCalled();
  }));

  it('should destroy the chart and unsubscribe from the workouts observable on ngOnDestroy', () => {
    // Set up a fake chart with a spy on destroy.
    const fakeChart = { destroy: jasmine.createSpy('destroy') };
    component.userChart = fakeChart as unknown as Chart;
    // Replace the subscription with a fake object that has an unsubscribe spy.
    component.subscription = { unsubscribe: jasmine.createSpy('unsubscribe') } as any;
    component.ngOnDestroy();
    expect(fakeChart.destroy).toHaveBeenCalled();
    expect(component.subscription.unsubscribe).toHaveBeenCalled();
  });
  it('should destroy the chart and unsubscribe from the workouts observable on ngOnDestroy', () => {
    // Create a fake chart with a spy on destroy.
    const fakeChart = { destroy: jasmine.createSpy('destroy') };
    component.userChart = fakeChart as unknown as Chart;

    // Replace the subscription with a fake object that has an unsubscribe spy.
    component.subscription = { unsubscribe: jasmine.createSpy('unsubscribe') } as any;

    // Call ngOnDestroy, which should trigger the destroy call.
    component.ngOnDestroy();

    // Verify that the chart's destroy method was called.
    expect(fakeChart.destroy).toHaveBeenCalled();

    // Also verify that the subscription is unsubscribed.
    expect(component.subscription.unsubscribe).toHaveBeenCalled();
  });
  it('should auto-select the first user when autoSelected is false and data is received', fakeAsync(() => {
    // Spy on the selectUser method so we can check it gets called.
    spyOn(component, 'selectUser').and.callThrough();

    // Prepare sample workout data.
    const data = [
      { userName: 'User1', workoutType: 'Running', workoutMinutes: 30 },
      { userName: 'User2', workoutType: 'Cycling', workoutMinutes: 40 }
    ];

    // Emit the workout data from the fake service.
    fakeWorkoutService.workouts$.next(data);
    // Flush any pending setTimeout calls in createChartForUser.
    tick();
    fixture.detectChanges();

    // The auto-selection should kick in since autoSelected is false initially.
    // Check that selectUser was called with the first aggregated user.
    expect(component.selectUser).toHaveBeenCalledWith(component.allWorkouts[0]);
    // Also, autoSelected should now be true.
    expect(component.autoSelected).toBeTrue();
  }));
it('should select the first user if the previously selected user no longer exists in new data', fakeAsync(() => {
  // Set an initial selectedUser that will not be present in the new data.
  const dummyUser = { name: 'Henry', workouts: ['Dancing'], totalMinutes: 40 };
  component.selectedUser = dummyUser;

  // Prepare new data that does NOT include Henry.
  const data = [
    { userName: 'Ivy', workoutType: 'Pilates', workoutMinutes: 50 }
  ];

  // Spy on selectUser to verify it is called.
  spyOn(component, 'selectUser').and.callThrough();

  // Emit new data.
  fakeWorkoutService.workouts$.next(data);
  tick();
  fixture.detectChanges();

  // Verify Henry is not in the aggregated workouts.
  expect(component.allWorkouts.find(u => u.name === 'Henry')).toBeUndefined();

  // Because allWorkouts is not empty, the branch "if (this.allWorkouts.length > 0)" should execute,
  // calling selectUser with the first available user (Ivy).
  expect(component.selectUser).toHaveBeenCalledWith(component.allWorkouts[0]);
}));

it('should select the first available user if the previously selected user is missing', fakeAsync(() => {
  // Arrange: Set a selectedUser that will not be in the new data.
  const missingUser: UserWorkout = { name: 'OldUser', workouts: ['Yoga'], totalMinutes: 50 };
  component.selectedUser = missingUser;

  // Prepare new data that does not include the missing user.
  const updatedData = [
    { userName: 'NewUser1', workoutType: 'Running', workoutMinutes: 30 },
    { userName: 'NewUser2', workoutType: 'Cycling', workoutMinutes: 40 }
  ];

  // Spy on selectUser to verify if it is called.
  spyOn(component, 'selectUser').and.callThrough();

  // Act: Emit the new data.
  fakeWorkoutService.workouts$.next(updatedData);
  tick();
  fixture.detectChanges();

  // Assert:
  // The missing user should not be found.
  expect(component.allWorkouts.find(u => u.name === missingUser.name)).toBeUndefined();

  // Since the missing user is gone but others exist, the first available user should be selected.
  expect(component.selectUser).toHaveBeenCalledWith(component.allWorkouts[0]);
}));


});
