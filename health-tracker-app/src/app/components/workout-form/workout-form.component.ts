import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { WorkoutService } from '../../services/workout.service';

@Component({
  selector: 'app-workout-form',
  templateUrl: './workout-form.component.html',
  styleUrls: ['./workout-form.component.css'],
  standalone: false
})
export class WorkoutFormComponent implements OnInit {
  workoutForm: FormGroup;
  workoutTypes: string[] = ['Running', 'Cycling', 'Yoga', 'Swimming', 'Weightlifting'];
  workouts: any[] = [];
  formSubmitted = false;

  constructor(private fb: FormBuilder, private workoutService: WorkoutService) {
    this.workoutForm = this.fb.group({
      userName: ['', Validators.required],
      workoutType: ['Running', Validators.required],
      workoutMinutes: ['', [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit() {
    this.loadWorkoutsFromStorage();
  }

  onSubmit() {
    this.formSubmitted = true;
    this.workoutForm.markAllAsTouched();

    if (this.workoutForm.invalid) {
      return;
    }

    // Get current workout entry
    const newWorkout = this.workoutForm.value;

    // Add createdAt timestamp
    newWorkout.createdAt = new Date().toISOString();  // Add the current date as createdAt

    // Retrieve existing workouts from localStorage
    const storedWorkouts = localStorage.getItem('workouts');
    this.workouts = storedWorkouts ? JSON.parse(storedWorkouts) : [];

    // Add the new workout to the list
    this.workouts.push(newWorkout);

    // Also add it to the service (if required)
    this.workoutService.addWorkout(newWorkout);

    // Reset the form with default workoutType.
    this.workoutForm.reset({ workoutType: 'Running' });
    this.formSubmitted = false;
  }

  private loadWorkoutsFromStorage() {
    const storedWorkouts = localStorage.getItem('workouts');
    if (storedWorkouts) {
      this.workouts = JSON.parse(storedWorkouts);
    }
  }
}
