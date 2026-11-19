import {Component, Input} from '@angular/core';
import Chart from "chart.js/auto";

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss'
})
export class LineChartComponent {
  @Input() years: number[] = [];
  @Input() medals: string[] = [];
  public lineChart!: Chart<"line", string[], number>;

  ngOnChanges() {
    if (this.years.length > 0) {
      this.buildChart(this.years, this.medals);
    }
  }

  buildChart(years: number[], medals: string[]) {
    this.lineChart = new Chart("countryChart", {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: "medals",
            data: medals,
            backgroundColor: '#0b868f'
          },
        ]
      },
      options: {
        aspectRatio: 2.5
      }
    });
  }
}
