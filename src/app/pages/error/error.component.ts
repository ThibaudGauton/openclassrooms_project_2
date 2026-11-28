import { Component } from '@angular/core';
import { Router } from '@angular/router';

const DEFAULT_MESSAGE = 'Unable to load the Olympic data. Please try again later.';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent {
  public message: string;

  constructor(private router: Router) {
    // A specific message can be passed through the navigation state (e.g. no data available).
    const state = this.router.getCurrentNavigation()?.extras.state;
    this.message = state?.['message'] ?? DEFAULT_MESSAGE;
  }
}
