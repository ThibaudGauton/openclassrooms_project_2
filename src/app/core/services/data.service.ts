import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private olympicUrl = './assets/mock/olympic.json';

  constructor(private http: HttpClient) { }

  getOlympicData() {
    return this.http.get<any[]>(this.olympicUrl).pipe();
  }
}
