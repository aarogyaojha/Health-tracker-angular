import { TestBed, ComponentFixture } from '@angular/core/testing';
import { UserWorkoutComponent } from './user-workout.component';
import { WorkoutService } from '../../services/workout.service';
import { of, Subject } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('UserWorkoutComponent', () => {
  let component: UserWorkoutComponent;
  let fixture: ComponentFixture<UserWorkoutComponent>;
  let workoutService: WorkoutService;
  let workoutsSubject: Subject<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [UserWorkoutComponent],
      providers: [
        {
          provide: WorkoutService,
          useValue: {
            workouts$: new Subject(),
            addWorkout: jasmine.createSpy('addWorkout'),
          },
        },
      ],
    });

    fixture = TestBed.createComponent(UserWorkoutComponent);
    component = fixture.componentInstance;
    workoutService = TestBed.inject(WorkoutService);
    workoutsSubject = workoutService.workouts$ as Subject<any>;
  });

  afterEach(() => {
    localStorage.removeItem('userWorkouts');
  });

  it('should initialize with empty workouts if localStorage is empty', () => {
    component.ngOnInit();
    expect(component.allWorkouts).toEqual([]);
  });

  it('should load and parse saved workouts from localStorage', () => {
    const mockWorkouts = [
      {
        name: 'User1',
        workouts: ['Running'],
        totalMinutes: 30,
        createdAt: '2023-01-01',
      },
    ];
    localStorage.setItem('userWorkouts', JSON.stringify(mockWorkouts));
    component.ngOnInit();
    expect(component.allWorkouts).toEqual(mockWorkouts);
  });

  it('should handle invalid localStorage data gracefully', () => {
    localStorage.setItem('userWorkouts', 'invalid JSON');
    component.ngOnInit();
    expect(component.allWorkouts).toEqual([]);
  });

  it('should transform raw workouts into UserWorkout array', () => {
    const rawWorkouts = [
      {
        userName: 'User1',
        workoutType: 'Running',
        workoutMinutes: 30,
        createdAt: '2023-01-01',
      },
      {
        userName: 'User1',
        workoutType: 'Cycling',
        workoutMinutes: 45,
        createdAt: '2023-01-02',
      },
    ];

    workoutsSubject.next(rawWorkouts);
    fixture.detectChanges();

    expect(component.allWorkouts.length).toBe(1);
    expect(component.allWorkouts[0].name).toBe('User1');
    expect(component.allWorkouts[0].totalMinutes).toBe(75);
    expect(component.allWorkouts[0].createdAt).toBe('2023-01-01');
  });

  it('should handle null raw workouts by clearing allWorkouts', () => {
    workoutsSubject.next(null);
    fixture.detectChanges();
    expect(component.allWorkouts).toEqual([]);
  });

  it('should filter workouts by search term', () => {
    component.allWorkouts = [
      {
        name: 'Alice',
        workouts: ['Yoga'],
        totalMinutes: 20,
        createdAt: '2023-01-01',
      },
      {
        name: 'Bob',
        workouts: ['Running'],
        totalMinutes: 30,
        createdAt: '2023-01-02',
      },
    ];
    component.searchControl.setValue('alice');
    const filtered = component.filteredWorkouts;
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Alice');
  });

  it('should sort workouts by createdAt descending', () => {
    component.allWorkouts = [
      { name: 'Alice', workouts: [], totalMinutes: 0, createdAt: '2023-01-02' },
      { name: 'Bob', workouts: [], totalMinutes: 0, createdAt: '2023-01-01' },
    ];
    component.sortWorkoutsByDate();
    expect(component.allWorkouts[0].name).toBe('Alice');
    expect(component.allWorkouts[1].name).toBe('Bob');
  });

  it('should unsubscribe on destroy', () => {
    component.ngOnInit();
    spyOn(component.subscription, 'unsubscribe');
    component.ngOnDestroy();
    expect(component.subscription.unsubscribe).toHaveBeenCalled();
  });

  it('should assign current timestamp if createdAt is missing when adding a workout', () => {
    const newWorkout = {
      name: 'Charlie',
      workouts: ['Running'],
      totalMinutes: 60,
    };

    component.addWorkout(
      newWorkout.name,
      newWorkout.workouts,
      newWorkout.totalMinutes
    );

    expect(
      component.allWorkouts[component.allWorkouts.length - 1].createdAt
    ).toBeTruthy();
    expect(
      new Date(
        component.allWorkouts[component.allWorkouts.length - 1].createdAt
      )
    ).toBeInstanceOf(Date);
  });

  it('should change the current page correctly within bounds', () => {
    component.allWorkouts = [
      {
        name: 'Alice',
        workouts: ['Running'],
        totalMinutes: 30,
        createdAt: '2023-01-01',
      },
      {
        name: 'Bob',
        workouts: ['Yoga'],
        totalMinutes: 45,
        createdAt: '2023-01-02',
      },
      {
        name: 'Charlie',
        workouts: ['Cycling'],
        totalMinutes: 60,
        createdAt: '2023-01-03',
      },
      {
        name: 'David',
        workouts: ['Swimming'],
        totalMinutes: 90,
        createdAt: '2023-01-04',
      },
      {
        name: 'Eve',
        workouts: ['Yoga'],
        totalMinutes: 120,
        createdAt: '2023-01-05',
      },
      {
        name: 'Frank',
        workouts: ['Running'],
        totalMinutes: 150,
        createdAt: '2023-01-06',
      },
    ];

    component.itemsPerPage = 2;
    component.currentPage = 1;

    const expectedTotalPages = Math.ceil(
      component.allWorkouts.length / component.itemsPerPage
    );

    component.changePage(3);
    expect(component.currentPage).toBe(3);

    component.changePage(10);
    expect(component.currentPage).toBe(expectedTotalPages);

    component.changePage(0);
    expect(component.currentPage).toBe(1);
  });

  it('should update items per page and reset currentPage to 1', () => {
    component.allWorkouts = [
      {
        name: 'Alice',
        workouts: ['Running'],
        totalMinutes: 30,
        createdAt: '2023-01-01',
      },
      {
        name: 'Bob',
        workouts: ['Yoga'],
        totalMinutes: 45,
        createdAt: '2023-01-02',
      },
      {
        name: 'Charlie',
        workouts: ['Cycling'],
        totalMinutes: 60,
        createdAt: '2023-01-03',
      },
      {
        name: 'David',
        workouts: ['Swimming'],
        totalMinutes: 90,
        createdAt: '2023-01-04',
      },
      {
        name: 'Eve',
        workouts: ['Yoga'],
        totalMinutes: 120,
        createdAt: '2023-01-05',
      },
      {
        name: 'Frank',
        workouts: ['Running'],
        totalMinutes: 150,
        createdAt: '2023-01-06',
      },
    ];

    component.itemsPerPage = 2;
    component.currentPage = 3;

    component.updateItemsPerPage(3);

    expect(component.itemsPerPage).toBe(3);
    expect(component.currentPage).toBe(1);

    const expectedTotalPages = Math.ceil(
      component.allWorkouts.length / component.itemsPerPage
    );
    expect(component.totalPages).toBe(expectedTotalPages);
  });

  it('should default to "all" if workoutTypeControl value is empty, null, or undefined', () => {
    component.workoutTypeControl.setValue(null);
    const filteredWorkouts1 = component.filteredWorkouts;
    expect(component.workoutTypeControl.value).toBeNull();
    expect(filteredWorkouts1).toBeDefined();

    component.workoutTypeControl.setValue('');
    const filteredWorkouts2 = component.filteredWorkouts;
    expect(component.workoutTypeControl.value).toBe('');
    expect(filteredWorkouts2).toBeDefined();

    component.workoutTypeControl.setValue(null);
    const filteredWorkouts3 = component.filteredWorkouts;
    expect(component.workoutTypeControl.value).toBeUndefined();
    expect(filteredWorkouts3).toBeDefined();
  });

  it('should filter workouts based on the selected workout type', () => {
    component.allWorkouts = [
      {
        name: 'Alice',
        workouts: ['Running'],
        totalMinutes: 30,
        createdAt: '2023-01-01',
      },
      {
        name: 'Bob',
        workouts: ['Cycling'],
        totalMinutes: 45,
        createdAt: '2023-01-02',
      },
      {
        name: 'Charlie',
        workouts: ['Running', 'Yoga'],
        totalMinutes: 60,
        createdAt: '2023-01-03',
      },
      {
        name: 'David',
        workouts: ['Yoga'],
        totalMinutes: 90,
        createdAt: '2023-01-04',
      },
      {
        name: 'Eve',
        workouts: ['Swimming'],
        totalMinutes: 120,
        createdAt: '2023-01-05',
      },
    ];

    component.workoutTypeControl.setValue('Running');
    const filteredWorkouts1 = component.filteredWorkouts;
    expect(filteredWorkouts1.length).toBe(2);
    expect(filteredWorkouts1[0].name).toBe('Alice');
    expect(filteredWorkouts1[1].name).toBe('Charlie');

    component.workoutTypeControl.setValue('Cycling');
    const filteredWorkouts2 = component.filteredWorkouts;
    expect(filteredWorkouts2.length).toBe(1);
    expect(filteredWorkouts2[0].name).toBe('Bob');

    component.workoutTypeControl.setValue('Yoga');
    const filteredWorkouts3 = component.filteredWorkouts;
    expect(filteredWorkouts3.length).toBe(2);
    expect(filteredWorkouts3[0].name).toBe('Charlie');
    expect(filteredWorkouts3[1].name).toBe('David');
  });

  it('should set createdAt to current date and time when adding a new workout', () => {
    const newWorkout = {
      name: 'Alice',
      workouts: ['Running'],
      totalMinutes: 30,
      createdAt: '',
    };

    const now = new Date();
    spyOn(Date, 'now').and.returnValue(now.getTime());

    component.addWorkout(
      newWorkout.name,
      newWorkout.workouts,
      newWorkout.totalMinutes
    );

    expect(newWorkout.createdAt).toBe(now.toISOString());
  });

  it('should subscribe to workouts$ and process data correctly', () => {
    const rawWorkouts = [
      { userName: 'User1', workoutType: 'Running', workoutMinutes: 30, createdAt: '2023-01-01' },
      { userName: 'User1', workoutType: 'Cycling', workoutMinutes: 45, createdAt: '2023-01-02' },
    ];

    workoutsSubject.next(rawWorkouts);
    fixture.detectChanges();

    expect(component.allWorkouts.length).toBe(1);
    expect(component.allWorkouts[0].name).toBe('User1');
    expect(component.allWorkouts[0].totalMinutes).toBe(75);
    expect(component.allWorkouts[0].createdAt).toBe('2023-01-01');
  });

  it('should keep earliest createdAt date for users with multiple workouts', () => {
    const rawWorkouts = [
      {
        userName: 'User1',
        workoutType: 'Running',
        workoutMinutes: 30,
        createdAt: '2023-01-02',
      },
      {
        userName: 'User1',
        workoutType: 'Cycling',
        workoutMinutes: 45,
        createdAt: '2023-01-01',
      },
    ];

    workoutsSubject.next(rawWorkouts);
    fixture.detectChanges();

    expect(component.allWorkouts[0].createdAt).toBe('2023-01-01');
  });

  it('should handle processing errors and log them', () => {
    const consoleSpy = spyOn(console, 'error');

    workoutsSubject.error('Test Error');

    expect(consoleSpy).toHaveBeenCalledWith('Error processing workouts:', 'Test Error');
  });
});
