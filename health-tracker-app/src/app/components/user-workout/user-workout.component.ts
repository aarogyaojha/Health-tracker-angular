import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WorkoutService } from '../../services/workout.service';

interface UserWorkout {
  name: string;
  workouts: string[];
  totalMinutes: number;
  createdAt: string;
}

@Component({
  selector: 'app-user-workout',
  templateUrl: './user-workout.component.html',
  styleUrls: ['./user-workout.component.css'],
  standalone: false,
})
export class UserWorkoutComponent implements OnInit, OnDestroy {
  searchControl = new FormControl('');
  workoutTypeControl = new FormControl('all');
  currentPage = 1;
  itemsPerPage = 5;

  allWorkouts: UserWorkout[] = [];
  workoutTypes = ['all', 'Running', 'Cycling', 'Yoga', 'Swimming'];

  public subscription!: Subscription;

  constructor(private workoutService: WorkoutService) {}

  ngOnInit() {

    const savedWorkouts = localStorage.getItem('userWorkouts');
    if (savedWorkouts) {
      this.allWorkouts = JSON.parse(savedWorkouts);

      this.allWorkouts.forEach((workout) => {
        if (!workout.createdAt) {
          workout.createdAt = new Date().toISOString();
        }
      });
      this.sortWorkoutsByDate();
    }

    this.subscription = this.workoutService.workouts$.subscribe((rawWorkouts) => {
      if (rawWorkouts) {
        try {
          const userWorkoutMap: { [key: string]: UserWorkout } = {};

          rawWorkouts.forEach((workout: any) => {

            const createdAt = workout.createdAt || new Date().toISOString();

            const { userName, workoutType, workoutMinutes } = workout;

            if (!userWorkoutMap[userName]) {
              userWorkoutMap[userName] = {
                name: userName,
                workouts: [],
                totalMinutes: 0,
                createdAt: createdAt,
              };
            } else {

              const existingDate = new Date(userWorkoutMap[userName].createdAt);
              const newDate = new Date(createdAt);
              if (newDate < existingDate) {
                userWorkoutMap[userName].createdAt = createdAt;
              }
            }

            userWorkoutMap[userName].workouts.push(workoutType);
            userWorkoutMap[userName].totalMinutes += workoutMinutes;
          });

          this.allWorkouts = Object.values(userWorkoutMap);
          this.sortWorkoutsByDate();
        } catch (error) {
        }
      } else {
        this.allWorkouts = [];
      }
    });
  }

  ngOnDestroy() {

    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


  public sortWorkoutsByDate() {
    this.allWorkouts.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
  }

  get filteredWorkouts() {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    const selectedType = this.workoutTypeControl.value || 'all';

    const filtered = this.allWorkouts.filter((user) => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm);
      const matchesType = selectedType === 'all' || user.workouts.includes(selectedType);
      return matchesSearch && matchesType;
    });


    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    return filtered;
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

  addWorkout(name: string, workouts: string[], totalMinutes: number) {
    const newWorkout = {
      name,
      workouts,
      totalMinutes,
      createdAt: new Date().toISOString(),
    };

    this.workoutService.addWorkout(newWorkout);
    this.allWorkouts.push(newWorkout);
    this.sortWorkoutsByDate();
  }
}
