import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  moviesLoaded = false;
  placeholderArray: Array<number> = [];
  
  constructor(public authService: AuthService) {
    //Create an array to loop through in ngIf
    this.placeholderArray = Array(5).fill(1); // [4,4,4,4,4]
   }

  ngOnInit(): void {
  }
  
}



