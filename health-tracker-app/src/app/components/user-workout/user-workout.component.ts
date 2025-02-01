import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

interface UserWorkout {
  name: string;
  workouts: string[];
  totalMinutes: number;
}

@Component({
  selector: 'app-user-workout',
  templateUrl: './user-workout.component.html',
  styleUrls: ['./user-workout.component.css'],
  standalone:false
})
export class UserWorkoutComponent implements OnInit {
  searchControl = new FormControl('');
  workoutTypeControl = new FormControl('all');
  currentPage = 1;
  itemsPerPage = 5;

  allWorkouts: UserWorkout[] = [];
  workoutTypes = ['all', 'Running', 'Cycling', 'Yoga', 'Swimming'];

ngOnInit() {
  const savedWorkouts = localStorage.getItem('workouts'); // Fetch under the key "workouts"
  if (savedWorkouts) {
    try {
      const rawWorkouts = JSON.parse(savedWorkouts); // Parse the stored array

      // Transform the raw data into the UserWorkout format
      const userWorkoutMap: { [key: string]: UserWorkout } = {};

      rawWorkouts.forEach((workout: any) => {
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



  get filteredWorkouts() {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    const selectedType = this.workoutTypeControl.value || 'all';

    return this.allWorkouts.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm);
      const matchesType = selectedType === 'all' || user.workouts.includes(selectedType);
      return matchesSearch && matchesType;
    });
  }

  get paginatedWorkouts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredWorkouts.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredWorkouts.length / this.itemsPerPage);
  }

  changePage(newPage: number) {
    this.currentPage = Math.max(1, Math.min(newPage, this.totalPages));
  }

  updateItemsPerPage(newSize: number) {
    this.itemsPerPage = newSize;
    this.currentPage = 1;
  }

  saveWorkoutDataToLocalStorage() {
    localStorage.setItem('userWorkouts', JSON.stringify(this.allWorkouts));
  }

  // Example: Adding a new user workout (you can call this from your UI)
  addWorkout(name: string, workouts: string[], totalMinutes: number) {
    this.allWorkouts.push({ name, workouts, totalMinutes });
    this.saveWorkoutDataToLocalStorage();
  }
}
