import { HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment as env } from '../../../environments/environment';
import { MoviesModel } from './Movies.model';

import { Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';
import {Router} from '@angular/router';

export interface TMDBInterface {
  results: Array<any>[];
}

@Injectable({
  providedIn: 'root'
})
export class TmdbService {

  pageNo: number = 1;
  apiKey = env.tmdbAPIKey;
  baseUri = env.tmdbbaseUri;
  images_uri = env.tmdbimages_uri;
  url: string = this.baseUri + "movie/popular?api_key=" + this.apiKey + "&language=en-US&page=" + this.pageNo;
  
  constructor(private http: HttpClient, private router: Router) { }
  stringyfy: string;

  getMovies(): Observable<MoviesModel> {
    return this.http.get<MoviesModel>(this.url).pipe(
      map(movie => movie)
    )
  }

  openDetails(id: number){
    console.log("ID: ", id);
   this.router.navigate(['details']);
  }
}

