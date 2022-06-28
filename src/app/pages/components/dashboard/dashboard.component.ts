import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { TmdbService } from 'src/app/services/tmdb/tmdb.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { MoviesModel } from '../../../services/tmdb/Movies.model';
import { catchError, retry, map } from 'rxjs/operators';
import { TMDBInterface } from'src/app/services/tmdb/tmdb.service';
import { ResultsModel } from 'src/app/services/tmdb/Results.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  moviesLoaded = false;
  placeholderArray: Array<number> = [];
  movies: MoviesModel;
  results: ResultsModel;
  subscription: Subscription;
  baseImageURI: string;

  constructor(public authService: AuthService, public tmdbService: TmdbService) {
    //Create an array to loop through image placeholders
    this.placeholderArray = Array(15).fill(1); // [4,4,4,4,4]
    this.baseImageURI = tmdbService.images_uri;
  }

  ngOnInit(): void {
    this.subscription = this.tmdbService.getMovies().subscribe(movie => {
      this.movies = movie;
      this.results = movie.results;
    })
  }

  openDetailsPage(id: number, movies_object: []){
   this.tmdbService.openDetailsPage(id, movies_object);
  }
  
  ngOnDestroy(){
    this.subscription.unsubscribe();
  }
}




