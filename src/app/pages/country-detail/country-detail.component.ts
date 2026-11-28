import {HttpErrorResponse} from '@angular/common/http';
import {Component, DestroyRef, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {DataService} from "../../core/services/data.service";
import {StatCard} from "../../core/models/stat-card.model";
import {Participation} from "../../core/models/participation.model";
import {Olympic} from "../../core/models/olympic.model";
import {catchError, EMPTY, map, switchMap} from "rxjs";

const COUNTRY_NOT_FOUND_MESSAGE = 'This country does not exist.';

@Component({
  selector: 'app-country',
  templateUrl: './country-detail.component.html',
  styleUrls: ['./country-detail.component.scss']
})
export class CountryDetailComponent implements OnInit {
  public years: number[] = [];
  public medals: string[] = [];
  public titlePage: string = '';
  public totalEntries: number = 0;
  public totalMedals: number = 0;
  public totalAthletes: number = 0;
  public isLoading: boolean = true;
  public error: string | null = null;
  public stats: StatCard[] = [];

  constructor(private route: ActivatedRoute, private router: Router, private dataService: DataService, private destroyRef: DestroyRef) {
  }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap((param: ParamMap) => {
        const index = Number(param.get('index'));
        if (!Number.isInteger(index) || index < 0) {
          this.redirectToNotFound();
          return EMPTY;
        }
        return this.dataService.getOlympicData().pipe(
          map((data: Olympic[]) => ({data, index}))
        );
      }),
      catchError((error: HttpErrorResponse) => {
        this.error = 'Unable to load the Olympic data. Please try again later.';
        this.isLoading = false;
        return EMPTY;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(({data, index}) => {
      this.isLoading = false;
      if (data.length === 0) {
        this.error = 'No Olympic data is available at the moment.';
        return;
      }
      const selectedCountry = data[index];
      if (!selectedCountry) {
        this.redirectToNotFound();
        return;
      }
      this.displayCountry(selectedCountry);
    });
  }

  private displayCountry(country: Olympic) {
    const participations: Participation[] = country.participations;
    this.titlePage = country.country;
    this.totalEntries = participations.length;
    this.years = participations.map((p: Participation) => p.year);
    this.medals = participations.map((p: Participation) => (p.medalsCount ?? 0).toString());
    this.totalMedals = participations.reduce((acc: number, p: Participation) => acc + (p.medalsCount ?? 0), 0);
    this.totalAthletes = participations.reduce((acc: number, p: Participation) => acc + (p.athleteCount ?? 0), 0);
    this.stats = [
      { label: 'Number of entries', value: this.totalEntries },
      { label: 'Total Number of medals', value: this.totalMedals },
      { label: 'Total Number of athletes', value: this.totalAthletes }
    ];
  }

  private redirectToNotFound() {
    this.router.navigate(['not-found'], {
      replaceUrl: true,
      state: { message: COUNTRY_NOT_FOUND_MESSAGE }
    });
  }
}
