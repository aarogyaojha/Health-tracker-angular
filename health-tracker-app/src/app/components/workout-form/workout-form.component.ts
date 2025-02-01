import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-workout-form',
  templateUrl: './workout-form.component.html',
  styleUrls: ['./workout-form.component.css'],
  standalone:false
})
export class WorkoutFormComponent implements OnInit {
  workoutForm: FormGroup;
  workoutTypes: string[] = ['Running', 'Cycling', 'Yoga', 'Swimming', 'Weightlifting'];
  workouts: any[] = [];
  formSubmitted = false;

  constructor(private fb: FormBuilder) {
    this.workoutForm = this.fb.group({
      userName: ['', Validators.required],
      workoutType: ['Running', Validators.required],
      workoutMinutes: ['', [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit() {
    // Load workouts from local storage
    const savedWorkouts = localStorage.getItem('workouts');
    if (savedWorkouts) {
      this.workouts = JSON.parse(savedWorkouts);
    }
  }

  onSubmit() {
    this.formSubmitted = true;
    this.workoutForm.markAllAsTouched();

    if (this.workoutForm.invalid) {
      return;
    }

    // Add workout to the list
    this.workouts.push(this.workoutForm.value);

    // Save updated workouts to local storage
    localStorage.setItem('workouts', JSON.stringify(this.workouts));

    // Reset the form
    this.workoutForm.reset({ workoutType: 'Running' });
    this.formSubmitted = false;
  }
}
