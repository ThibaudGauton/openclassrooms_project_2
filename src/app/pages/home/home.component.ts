import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import {DataService} from "../../core/services/data.service";
import {StatCard} from "../../core/models/stat-card.model";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public countries: string[] = [];
  public sumOfAllMedalsYears: number[] = [];
  public totalCountries: number = 0
  public totalJOs: number = 0
  public error!:string
  titlePage: string = "Medals per Country";
  public stats: StatCard[] = [];

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.dataService.getOlympicData().subscribe(
      (data) => {
        console.log(`Liste des données : ${JSON.stringify(data)}`);
        if (data && data.length > 0) {
          this.totalJOs = Array.from(new Set(data.map((i: any) => i.participations.map((f: any) => f.year)).flat())).length;
          this.countries = data.map((i: any) => i.country);
          this.totalCountries = this.countries.length;
          const medals = data.map((i: any) => i.participations.map((i: any) => (i.medalsCount)));
          this.sumOfAllMedalsYears = medals.map((i) => i.reduce((acc: any, i: any) => acc + i, 0));
          this.stats = [
            { label: 'Number of countries', value: this.totalCountries },
            { label: 'Number of JOs', value: this.totalJOs }
          ];
        }
      },
      (error:HttpErrorResponse) => {
        console.log(`erreur : ${error}`);
        this.error = error.message
      }
    )
  }
}

