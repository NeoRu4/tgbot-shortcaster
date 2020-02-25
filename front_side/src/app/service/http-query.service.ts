import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class HttpQueryService {

  constructor(private http: HttpClient,
              private storage: StorageService) {

      if (!storage.baseUrl) {
        storage.baseUrl = 'http://neoru4.ddns.net:8080';
      }
  }

  post <T>(path: string, params: any): Observable<any> {

    const bodyString = JSON.stringify(params); 
    const headers = new HttpHeaders({'Content-Type': 'application/json'});

    return this.http.post<T>(this.storage.baseUrl + path, bodyString, {headers});
  }
  

  getListMovies(searchString: string, max: number, offset: number, orderBy?: string, orderField?:string ): 
  Observable<{id: number, year: number, name: string}[]> {
    
    const params = {
      searchString: searchString,
      max: max,
      offset: offset,
      orderBy: orderBy || 'desc',
      orderField: orderField || 'year'
    }

    return this.post('/list', params);
  }


}
