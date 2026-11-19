import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import Chart from 'chart.js/auto';
import {DataService} from "../../core/services/data.service";
import {StatCard} from "../../core/models/stat-card.model";
import {Participation} from "../../core/models/participation.model";
import {Olympic} from "../../core/models/olympic.model";


@Component({
  selector: 'app-country',
  templateUrl: './country-detail.component.html',
  styleUrls: ['./country-detail.component.scss']
})
export class CountryDetailComponent implements OnInit {
  public years: number[] = [];
  public medals: string[] = [];
  public titlePage: string = '';
  public totalEntries: any = 0;
  public totalMedals: number = 0;
  public totalAthletes: number = 0;
  public error!: string;
  public stats: StatCard[] = [];

  constructor(private route: ActivatedRoute, private router: Router, private dataService: DataService) {
  }

  ngOnInit() {
    let countryName: string | null = null
    this.route.paramMap.subscribe((param: ParamMap) => countryName = param.get('countryName'));
    this.dataService.getOlympicData().subscribe(
      (data: Olympic[]) => {
        if (data && data.length > 0) {
          const selectedCountry = data.find((i: Olympic) => i.country === countryName);
          this.titlePage = selectedCountry!.country;
          const participations = selectedCountry?.participations.map((i: Participation) => i);
          this.totalEntries = participations?.length ?? 0;
          this.years = selectedCountry?.participations.map((i: Participation) => i.year) ?? [];
          this.medals = selectedCountry?.participations.map((i: Participation) => i.medalsCount.toString()) ?? [];
          this.totalMedals = this.medals.reduce((accumulator: number, item: string) => accumulator + parseInt(item), 0);
          const nbAthletes = selectedCountry?.participations.map((i: Participation) => i.athleteCount.toString()) ?? []
          this.totalAthletes = nbAthletes.reduce((accumulator: number, item: string) => accumulator + parseInt(item), 0);
          this.stats = [
            { label: 'Number of entries', value: this.totalEntries },
            { label: 'Total Number of medals', value: this.totalMedals },
            { label: 'Total Number of athletes', value: this.totalAthletes }
          ];
        }
      },
      (error: HttpErrorResponse) => {
        this.error = error.message
      }
    );
  }
}
