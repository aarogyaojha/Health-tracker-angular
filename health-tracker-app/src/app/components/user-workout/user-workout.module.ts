import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { UserWorkoutComponent } from './user-workout.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    UserWorkoutComponent
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  exports:[
    UserWorkoutComponent
  ],
  providers: [],
})
export class UserWorkoutModule { }
