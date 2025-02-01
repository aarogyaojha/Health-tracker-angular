import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WorkoutChartComponent } from './workout-chart.component';

@NgModule({
  declarations: [
    WorkoutChartComponent
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  exports:[
    WorkoutChartComponent
  ],
  providers: [],
})
export class WorkoutChartModule { }
