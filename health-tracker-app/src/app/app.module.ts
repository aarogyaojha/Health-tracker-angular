import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WorkoutFormComponent } from './components/workout-form/workout-form.component';
import { WorkoutChartComponent } from './components/workout-chart/workout-chart.component';
import { UserWorkoutComponent } from './components/user-workout/user-workout.component';

@NgModule({
  declarations: [
    AppComponent,
    WorkoutFormComponent,
    WorkoutChartComponent,
    UserWorkoutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
