import {Component, Input} from '@angular/core';
import {StatCard} from "../../core/models/stat-card.model";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() titlePage: string = '';
  @Input() stats: StatCard[] = [];
}
