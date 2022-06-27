import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { NgForm } from "@angular/forms";
import{ User } from "../../../services/auth/user"
import { Router, Routes } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  isLoading: boolean = false;
  user: User | undefined;
  errorMessage:string = "";

  constructor(public authService: AuthService, public router: Router) { }

  ngOnInit(): void {
  }
   
  ngOnDestroy(){
    this.isLoading = false;
  }
}
