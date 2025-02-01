import { Component, OnInit, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { WorkoutService } from '../../services/workout.service'; // Adjust the path as needed

// Register Chart.js components
Chart.register(...registerables);

interface UserWorkout {
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
  rawWorkouts: any[] = []; // Stores the original workouts array from the service
  userChart: Chart | null = null; // Chart instance

  private subscription!: Subscription;
  // Flag to ensure that the auto-selection happens only once.
  private autoSelected = false;

  constructor(private workoutService: WorkoutService) {}

  ngOnInit(): void {
    // Subscribe to the workouts observable from the WorkoutService.
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

      // Automatically select the first user only once if there is data
      if (!this.autoSelected && this.allWorkouts.length > 0) {
        this.autoSelected = true;
        this.selectUser(this.allWorkouts[0]);
      }
      // If a user is already selected, update the chart for that user.
      else if (this.selectedUser) {
        // Check if the selected user still exists in the updated data.
        const exists = this.allWorkouts.find(u => u.name === this.selectedUser?.name);
        if (exists) {
          this.createChartForUser(this.selectedUser.name);
        } else if (this.allWorkouts.length > 0) {
          // If not, select the first available user.
          this.selectUser(this.allWorkouts[0]);
        }
      }
    });
  }

  // Called when a user is selected (for example, via a sidebar or list)
  selectUser(user: UserWorkout): void {
    this.selectedUser = user;
    this.createChartForUser(user.name);
  }

  createChartForUser(userName: string): void {
    // If a chart already exists, destroy it before creating a new one.
    if (this.userChart) {
      this.userChart.destroy();
    }

    // Delay execution to ensure DOM updates
    setTimeout(() => {
      // Filter raw workouts for the selected user and aggregate minutes by workout type.
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

      // Get the canvas element where the chart will be rendered.
      const canvas = document.getElementById('userWorkoutChart') as HTMLCanvasElement;
      if (!canvas) {
        console.error('Canvas element not found!');
        return;
      }

      // Create the chart configuration.
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

      // Create a new Chart instance.
      this.userChart = new Chart(canvas, config);
    }, 0); // Allow DOM updates before executing
  }


  ngOnDestroy(): void {
    // Destroy the chart instance if it exists.
    if (this.userChart) {
      this.userChart.destroy();
    }
    // Unsubscribe from the WorkoutService to prevent memory leaks.
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
