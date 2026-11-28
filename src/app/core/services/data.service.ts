import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {Olympic} from "../models/olympic.model";
import {Participation} from "../models/participation.model";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private olympicUrl = './assets/mock/olympic.json';

  constructor(private http: HttpClient) { }

  /**
   * Returns the olympic data sorted by total number of medals (descending).
   * The order matters: the country detail route uses the index in this list.
   */
  getOlympicData(): Observable<Olympic[]> {
    return this.http.get<Olympic[]>(this.olympicUrl).pipe(
      map((data: Olympic[]) =>
        [...data].sort((a: Olympic, b: Olympic) => this.getTotalMedals(b) - this.getTotalMedals(a))
      )
    );
  }

  private getTotalMedals(olympic: Olympic): number {
    return olympic.participations.reduce((acc: number, p: Participation) => acc + p.medalsCount, 0);
  }
}
