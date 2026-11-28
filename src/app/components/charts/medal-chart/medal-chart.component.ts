import {Component, Input, OnChanges, OnDestroy} from '@angular/core';
import Chart, {ChartType} from "chart.js/auto";
import {Router} from "@angular/router";

const CHART_COLORS = ['#7B3F56', '#7B8BC4', '#9A7E9E', '#B9E4EC', '#CDE3F5', '#A8707D'];

// Geometry of the labels drawn around the pie by legendLinesPlugin
const LABEL_FONT = '13px sans-serif';
const LABEL_LINE_RADIAL = 20;     // length of the line going out of the pie
const LABEL_LINE_HORIZONTAL = 20; // length of the horizontal line
const LABEL_TEXT_GAP = 6;         // space between the line and the text
const LABEL_SAFETY_MARGIN = 4;

/**
 * Horizontal padding needed so that the longest label is never cut on the sides of the canvas.
 */
function getHorizontalPadding(labels: string[]): number {
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) {
    return 60;
  }
  ctx.font = LABEL_FONT;
  const maxLabelWidth = Math.max(0, ...labels.map((label: string) => ctx.measureText(label).width));
  return Math.ceil(LABEL_LINE_RADIAL + LABEL_LINE_HORIZONTAL + LABEL_TEXT_GAP + maxLabelWidth + LABEL_SAFETY_MARGIN);
}

const legendLinesPlugin = {
  id: 'legendLines',
  afterDraw: (chart: Chart) => {
    const { ctx, chartArea } = chart;
    const meta = chart.getDatasetMeta(0);
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;

    ctx.save();
    ctx.font = LABEL_FONT;
    ctx.fillStyle = '#333';
    ctx.textBaseline = 'middle';

    meta.data.forEach((arc: any, index: number) => {
      const label = chart.data.labels ? (chart.data.labels[index] as string) : '';
      const angle = (arc.startAngle + arc.endAngle) / 2;
      const radius = arc.outerRadius;

      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;

      const x2 = centerX + Math.cos(angle) * (radius + LABEL_LINE_RADIAL);
      const y2 = centerY + Math.sin(angle) * (radius + LABEL_LINE_RADIAL);

      const isRight = Math.cos(angle) >= 0;
      const x3 = isRight ? x2 + LABEL_LINE_HORIZONTAL : x2 - LABEL_LINE_HORIZONTAL;
      const y3 = y2;

      ctx.strokeStyle = '#999';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.stroke();

      ctx.textAlign = isRight ? 'left' : 'right';
      ctx.fillText(label, x3 + (isRight ? LABEL_TEXT_GAP : -LABEL_TEXT_GAP), y3);
    });

    ctx.restore();
  }
};

@Component({
  selector: 'app-medal-chart',
  standalone: true,
  imports: [],
  templateUrl: './medal-chart.component.html',
  styleUrl: './medal-chart.component.scss'
})
export class MedalChartComponent implements OnChanges, OnDestroy {
  @Input() countries: string[] = [];
  @Input() sumOfAllMedalsYears: number[] = [];
  public pieChart!: Chart<ChartType, number[], string> | Chart;

  constructor(private router: Router) { }

  ngOnChanges() {
    if (this.countries.length > 0) {
      this.buildPieChart(this.countries, this.sumOfAllMedalsYears);
    }
  }

  ngOnDestroy() {
    this.pieChart?.destroy();
  }

  buildPieChart(countries: string[], sumOfAllMedalsYears: number[]) {
    const horizontalPadding = getHorizontalPadding(countries);
    const data = {
      labels: countries,
      datasets: [
        {
          label: '🏅',
          data: sumOfAllMedalsYears,
          backgroundColor: CHART_COLORS,
        }
      ]
    };
    const config = {
      type: 'pie' as const,
      data: data,
      plugins: [legendLinesPlugin],
      options: {
        responsive: true,
        layout: {
          // Sides: room for the longest label. Top: the labels only need ~30px above the pie.
          padding: { top: 35, right: horizontalPadding, bottom: 60, left: horizontalPadding }
        },
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: 'Medals per Country'
          },
          tooltip: {
            displayColors: false
          }
        },
        onClick: (e: any) => {
          if (e.native) {
            const points = this.pieChart.getElementsAtEventForMode(e.native, 'point', { intersect: true }, true);
            if (points.length) {
              const firstPoint = points[0];
              this.router.navigate(['country', firstPoint.index]);
            }
          }
        }
      },
    };

    if (this.pieChart) {
      this.pieChart.destroy();
    }

    this.pieChart = new Chart("DashboardPieChart", config);
/*

    const pieChart = new Chart("DashboardPieChart", {
      type: 'pie',
      data: {
        labels: countries,
        datasets: [{
          label: 'Medals',
          data: sumOfAllMedalsYears,
          backgroundColor: ['#0b868f', '#adc3de', '#7a3c53', '#8f6263', 'orange', '#94819d'],
          hoverOffset: 4
        }],
      },
      options: {
        aspectRatio: 2.5,
        onClick: (e) => {
          if (e.native) {
            const points = pieChart.getElementsAtEventForMode(e.native, 'point', { intersect: true }, true)
            if (points.length) {
              const firstPoint = points[0];
              const countryName = pieChart.data.labels ? pieChart.data.labels[firstPoint.index] : '';
              this.router.navigate(['country', countryName]);
            }
          }
        }
      }
    });
    this.pieChart = pieChart;*/
  }
}
