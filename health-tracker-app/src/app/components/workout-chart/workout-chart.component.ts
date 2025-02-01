import { Component, OnInit, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

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
  rawWorkouts: any[] = []; // to store the original array from localStorage
  userChart: Chart | null = null; // Chart instance

  constructor() {}

  ngOnInit(): void {
    const savedWorkouts = localStorage.getItem('workouts'); // Fetch data under the key "workouts"
    if (savedWorkouts) {
      try {
        this.rawWorkouts = JSON.parse(savedWorkouts);
        // Transform the raw data into the UserWorkout format
        const userWorkoutMap: { [key: string]: UserWorkout } = {};

        this.rawWorkouts.forEach((workout: any) => {
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

        this.allWorkouts = Object.values(userWorkoutMap); // Convert map to array
        console.log('Transformed Workouts:', this.allWorkouts); // Debugging
      } catch (error) {
        console.error('Error parsing or transforming local storage data:', error);
      }
    } else {
      console.log('No data found in local storage.');
    }
  }

  // Called when a user is selected from the sidebar
  selectUser(user: UserWorkout): void {
    this.selectedUser = user;
    // Create or update the chart for the selected user
    this.createChartForUser(user.name);
  }

  // Create a bar chart for a given user
  createChartForUser(userName: string): void {
    // If a chart already exists, destroy it to avoid duplicates
    if (this.userChart) {
      this.userChart.destroy();
    }

    // Filter raw workouts for the selected user and aggregate minutes by workout type
    const userWorkouts = this.rawWorkouts.filter(
      (w) => w.userName === userName
    );
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

    // Get the canvas element
    const canvas = document.getElementById('userWorkoutChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas element not found!');
      return;
    }

    // Create the chart
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
  }

  ngOnDestroy(): void {
    // Destroy the chart when the component is destroyed
    if (this.userChart) {
      this.userChart.destroy();
    }
  }
}
