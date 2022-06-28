import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { Router, ActivatedRoute, ParamMap} from '@angular/router';
import { TmdbService } from 'src/app/services/tmdb/tmdb.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit, OnDestroy{

  subscription: Subscription;
  movie_id;
  movie_object: any;
  isLoading: boolean = false;
  imageBaseUri: string;
  
  constructor(private route: ActivatedRoute, public tmdbService: TmdbService) { }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.imageBaseUri = this.tmdbService.images_uri;
    this.isLoading = true;
    this.subscription = this.route.queryParams.subscribe(params=>{
      this.movie_object = params;
      this.isLoading = false;
    }); 
  }
}