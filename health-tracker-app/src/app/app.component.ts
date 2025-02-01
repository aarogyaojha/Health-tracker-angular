import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'health-tracker-app';
  selectedTab: string = 'user-form'; // Default tab

  selectTab(tab: string) {
    this.selectedTab = tab;
  }
}
