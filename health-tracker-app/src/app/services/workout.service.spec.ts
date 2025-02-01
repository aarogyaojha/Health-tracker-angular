import { TestBed } from '@angular/core/testing';
import { WorkoutService } from './workout.service';
import { BehaviorSubject } from 'rxjs';

describe('WorkoutService', () => {
  let service: WorkoutService;
  let mockWorkouts$ = new BehaviorSubject<any[]>([]);
  let setItemSpy: jasmine.Spy;
  let getItemSpy: jasmine.Spy;

  beforeEach(() => {

    getItemSpy = spyOn(localStorage, 'getItem').and.returnValue(null);
    setItemSpy = spyOn(localStorage, 'setItem').and.callThrough();

    TestBed.configureTestingModule({
      providers: [WorkoutService]
    });

    service = TestBed.inject(WorkoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get default workouts when none are stored', () => {

    const workouts = service.getAllWorkouts();


    expect(workouts.length).toBe(3);
    expect(workouts[0].userName).toBe('smith');
    expect(workouts[1].userName).toBe('john');
    expect(workouts[2].userName).toBe('emily');

    expect(setItemSpy).toHaveBeenCalledWith(
      'workouts',
      jasmine.any(String)
    );
  });

  it('should add a new workout and store it in localStorage', () => {
    const newWorkout = {
      name: 'John',
      workouts: ['Running'],
      totalMinutes: 30,
    };


    service.addWorkout(newWorkout);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'workouts',
      jasmine.any(String)
    );


    const savedWorkouts = JSON.parse(setItemSpy.calls.mostRecent().args[1]);


    expect(savedWorkouts.length).toBe(4);
    expect(savedWorkouts[savedWorkouts.length - 1].userName).toBe('John');
    expect(savedWorkouts[savedWorkouts.length - 1].workoutType).toBe('Running');
  });

  it('should correctly add a new workout with a createdAt field', () => {
    const newWorkout = {
      name: 'Alice',
      workouts: ['Cycling'],
      totalMinutes: 60,
    };


    service.addWorkout(newWorkout);

    const savedWorkouts = JSON.parse(setItemSpy.calls.mostRecent().args[1]);

    const addedWorkout = savedWorkouts[savedWorkouts.length - 1];
    expect(addedWorkout.createdAt).toBeDefined();
    expect(new Date(addedWorkout.createdAt)).toBeTruthy(); // Ensure it's a valid date string
  });
});
