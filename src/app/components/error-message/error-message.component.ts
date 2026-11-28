import {Component, Input} from '@angular/core';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.scss'
})
export class ErrorMessageComponent {
  @Input() message: string = 'An unexpected error occurred.';
  @Input() showBackLink: boolean = false;
}
