import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Olympic} from "../models/olympic.model";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private olympicUrl = './assets/mock/olympic.json';

  constructor(private http: HttpClient) { }

  getOlympicData() {
    return this.http.get<Olympic[]>(this.olympicUrl).pipe();
  }
}
