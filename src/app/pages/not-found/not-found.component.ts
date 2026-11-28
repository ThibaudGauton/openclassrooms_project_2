import { Component } from '@angular/core';
import { Router } from '@angular/router';

const DEFAULT_MESSAGE = 'No corresponding page found';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {
  public message: string;

  constructor(private router: Router) {
    // A specific message can be passed through the navigation state (e.g. unknown country).
    const state = this.router.getCurrentNavigation()?.extras.state;
    this.message = state?.['message'] ?? DEFAULT_MESSAGE;
  }
}
