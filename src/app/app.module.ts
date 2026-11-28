import { provideHttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { CountryDetailComponent } from "./pages/country-detail/country-detail.component";
import {MedalChartComponent} from "./components/charts/medal-chart/medal-chart.component";
import {HeaderComponent} from "./components/header/header.component";
import {LineChartComponent} from "./components/charts/line-chart/line-chart.component";
import {ErrorMessageComponent} from "./components/error-message/error-message.component";

@NgModule({
  declarations: [AppComponent, DashboardComponent, NotFoundComponent, CountryDetailComponent],
  imports: [BrowserModule, AppRoutingModule, MedalChartComponent, HeaderComponent, LineChartComponent, ErrorMessageComponent],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent],
})
export class AppModule {}
