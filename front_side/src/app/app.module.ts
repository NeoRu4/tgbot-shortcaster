import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UiInputModule } from './components/ui-input';
import { MoviesListModule } from './pages/movies-list/movies-list.module';
import { StorageService } from './service/storage.service';
import { HttpQueryService } from './service/http-query.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    FormsModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    UiInputModule,
    MoviesListModule,
    CommonModule,
  ],
  providers: [
    StorageService, 
    HttpQueryService
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  bootstrap: [AppComponent]
})
export class AppModule { }
