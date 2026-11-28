import {Component, DestroyRef, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DataService} from "../../core/services/data.service";
import {StatCard} from "../../core/models/stat-card.model";
import {Olympic} from "../../core/models/olympic.model";
import {Participation} from "../../core/models/participation.model";
import {catchError, EMPTY} from "rxjs";

@Component({
  selector: 'app-home',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  public countries: string[] = [];
  public sumOfAllMedalsYears: number[] = [];
  public totalCountries: number = 0
  public totalJOs: number = 0
  public isLoading: boolean = true;
  titlePage: string = "Medals per Country";
  public stats: StatCard[] = [];

  constructor(private dataService: DataService, private router: Router, private destroyRef: DestroyRef) { }

  ngOnInit() {
    this.dataService.getOlympicData().pipe(
      catchError(() => {
        this.redirectToErrorPage();
        return EMPTY;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((data: Olympic[]) => {
      if (data.length === 0) {
        this.redirectToErrorPage('No Olympic data is available at the moment.');
        return;
      }
      this.isLoading = false;
      this.totalJOs = new Set(data.flatMap((i: Olympic) => i.participations.map((p: Participation) => p.year))).size;
      this.countries = data.map((i: Olympic) => i.country);
      this.totalCountries = this.countries.length;
      this.sumOfAllMedalsYears = data.map((i: Olympic) =>
        i.participations.reduce((acc: number, p: Participation) => acc + (p.medalsCount ?? 0), 0)
      );
      this.stats = [
        { label: 'Number of countries', value: this.totalCountries },
        { label: 'Number of JOs', value: this.totalJOs }
      ];
    });
  }

  private redirectToErrorPage(message?: string) {
    this.router.navigate(['error'], { replaceUrl: true, state: { message } });
  }
}
