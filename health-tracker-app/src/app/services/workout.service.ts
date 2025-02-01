import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private workoutsKey = 'workouts';

  // Initialize with stored workouts (if any) or an empty array, and add default data if none exists.
  private workoutsSubject = new BehaviorSubject<any[]>(this.getStoredWorkouts());
  workouts$ = this.workoutsSubject.asObservable();

  private getStoredWorkouts(): any[] {
    const savedWorkouts = localStorage.getItem(this.workoutsKey);
    let workouts = savedWorkouts ? JSON.parse(savedWorkouts) : [];

    // If no workouts are found, add default ones
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

  // Call this method to add a new workout
  addWorkout(workout: any): void {
    const currentWorkouts = this.getStoredWorkouts();

    // Ensure createdAt is added if missing (should not happen here, but just in case)
    if (!workout.createdAt) {
      workout.createdAt = new Date().toISOString();
    }

    currentWorkouts.push(workout);
    localStorage.setItem(this.workoutsKey, JSON.stringify(currentWorkouts));

    // Emit the updated workouts list to subscribers
    this.workoutsSubject.next(currentWorkouts);
  }

  // Get all workouts, including the createdAt field
  getAllWorkouts() {
    return this.getStoredWorkouts();
  }
}
