import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WorkoutFormComponent } from './workout-form.component';

@NgModule({
  declarations: [
    WorkoutFormComponent
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  exports:[
    WorkoutFormComponent
  ],
  providers: [],
})
export class WorkoutFormModule { }
