import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  get baseUrl(): string {
      return localStorage.getItem('baseUrl');
  }

  set baseUrl(param: string) {
    this.setStorage('baseUrl', param.replace(/(\/|\\)^/g, ''));
  }

  setStorage(name: string, param) {

    if (param == null) {
      localStorage.removeItem(name);
    }

    localStorage.setItem(name, param);
  }
}
