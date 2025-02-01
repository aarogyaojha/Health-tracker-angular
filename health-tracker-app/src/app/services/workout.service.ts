import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private workoutsKey = 'workouts';


  private workoutsSubject = new BehaviorSubject<any[]>(this.getStoredWorkouts());
  workouts$ = this.workoutsSubject.asObservable();

  private getStoredWorkouts(): any[] {
    const savedWorkouts = localStorage.getItem(this.workoutsKey);
    let workouts = savedWorkouts ? JSON.parse(savedWorkouts) : [];

    if (workouts.length === 0) {
      workouts = [
        {
          userName: "smith",
          workoutType: "Running",
          workoutMinutes: 130,
          createdAt: "2025-02-01T08:08:53.161Z"
        },
        {
          userName: "john",
          workoutType: "Cycling",
          workoutMinutes: 60,
          createdAt: "2025-02-01T09:15:30.123Z"
        },
        {
          userName: "emily",
          workoutType: "Yoga",
          workoutMinutes: 45,
          createdAt: "2025-02-01T10:05:10.456Z"
        }
      ];
      localStorage.setItem(this.workoutsKey, JSON.stringify(workouts));
    }

    return workouts;
  }

  addWorkout(workout: any): void {
    const currentWorkouts = this.getStoredWorkouts();

    if (!workout.createdAt) {
      workout.createdAt = new Date().toISOString();
    }

    currentWorkouts.push(workout);
    localStorage.setItem(this.workoutsKey, JSON.stringify(currentWorkouts));

    this.workoutsSubject.next(currentWorkouts);
  }

  getAllWorkouts() {
    return this.getStoredWorkouts();
  }
}
