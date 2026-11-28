import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Component, DestroyRef, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import {DataService} from "../../core/services/data.service";
import {StatCard} from "../../core/models/stat-card.model";
import {Olympic} from "../../core/models/olympic.model";
import {Participation} from "../../core/models/participation.model";
import {catchError, EMPTY, map, tap} from "rxjs";

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
  public error!:string
  titlePage: string = "Medals per Country";
  public stats: StatCard[] = [];

  constructor(private dataService: DataService, private destroyRef: DestroyRef) { }

  ngOnInit() {
    this.dataService.getOlympicData().pipe(
      map((data: Olympic[]) => {
        if (data && data.length > 0) {
          this.totalJOs = Array.from(new Set(data.map((i: Olympic) => i.participations.map((f: Participation) => f.year)).flat())).length;
          this.countries = data.map((i: Olympic) => i.country);
          this.totalCountries = this.countries.length;
          const medals = data.map((i: Olympic) => i.participations.map((p: Participation) => (p.medalsCount)));
          this.sumOfAllMedalsYears = medals.map((i: number[]) => i.reduce((acc: number, i: number) => acc + i, 0));
          this.stats = [
            { label: 'Number of countries', value: this.totalCountries },
            { label: 'Number of JOs', value: this.totalJOs }
          ];
        }
        return data;
      }),
      catchError((error: HttpErrorResponse) => {
        this.error = error.message;
        return EMPTY;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }
}

