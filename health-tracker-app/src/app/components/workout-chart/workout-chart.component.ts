import { Component, OnInit, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { WorkoutService } from '../../services/workout.service'; // Adjust the path as needed


Chart.register(...registerables);

export interface UserWorkout {
  name: string;
  workouts: string[];
  totalMinutes: number;
}

@Component({
  selector: 'app-workout-chart',
  templateUrl: './workout-chart.component.html',
  styleUrls: ['./workout-chart.component.css'],
  standalone: false
})
export class WorkoutChartComponent implements OnInit, OnDestroy {
  allWorkouts: UserWorkout[] = [];
  selectedUser: UserWorkout | null = null;
  rawWorkouts: any[] = [];
  userChart: Chart | null = null;

  public subscription!: Subscription;

  public autoSelected = false;

  constructor(private workoutService: WorkoutService) {}

  ngOnInit(): void {

    this.subscription = this.workoutService.workouts$.subscribe(data => {
      this.rawWorkouts = data;

      // Transform the raw data into the UserWorkout format.
      const userWorkoutMap: { [key: string]: UserWorkout } = {};
      data.forEach((workout: any) => {
        const { userName, workoutType, workoutMinutes } = workout;
        if (!userWorkoutMap[userName]) {
          userWorkoutMap[userName] = {
            name: userName,
            workouts: [],
            totalMinutes: 0,
          };
        }
        userWorkoutMap[userName].workouts.push(workoutType);
        userWorkoutMap[userName].totalMinutes += workoutMinutes;
      });

      this.allWorkouts = Object.values(userWorkoutMap);
      console.log('Transformed Workouts:', this.allWorkouts);

      if (!this.autoSelected && this.allWorkouts.length > 0) {
        this.autoSelected = true;
        this.selectUser(this.allWorkouts[0]);
      }


      else if (this.selectedUser) {

        const exists = this.allWorkouts.find(u => u.name === this.selectedUser?.name);
        if (exists) {
          this.createChartForUser(this.selectedUser.name);
        }
      }
    });
  }

  selectUser(user: UserWorkout): void {
    this.selectedUser = user;
    this.createChartForUser(user.name);
  }

  createChartForUser(userName: string): void {

    if (this.userChart) {
      this.userChart.destroy();
    }


    setTimeout(() => {
      const userWorkouts = this.rawWorkouts.filter((w) => w.userName === userName);
      const activityMap: { [activity: string]: number } = {};

      userWorkouts.forEach((workout) => {
        const { workoutType, workoutMinutes } = workout;
        if (!activityMap[workoutType]) {
          activityMap[workoutType] = 0;
        }
        activityMap[workoutType] += workoutMinutes;
      });

      const labels = Object.keys(activityMap);
      const data = Object.values(activityMap);

      const canvas = document.getElementById('userWorkoutChart') as HTMLCanvasElement;
      if (!canvas) {
        console.error('Canvas element not found!');
        return;
      }

      const config: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Minutes',
            data: data,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            x: {
              title: {
                display: true,
                text: 'Workout Activity'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Minutes'
              }
            }
          }
        }
      };
      this.userChart = new Chart(canvas, config);
    }, 0);
  }


  ngOnDestroy(): void {

    if (this.userChart) {
      this.userChart.destroy();
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
