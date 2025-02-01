import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { UserWorkoutModule } from './components/user-workout/user-workout.module';
import { WorkoutChartModule } from './components/workout-chart/workout-chart.module';
import { WorkoutFormModule } from './components/workout-form/workout-form.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    UserWorkoutModule,
    WorkoutChartModule,
    WorkoutFormModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
