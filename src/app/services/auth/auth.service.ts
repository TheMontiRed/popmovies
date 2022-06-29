//Credit to https://remotestack.io/angular-firebase-authentication-example-tutorial/

import { Injectable, NgZone } from '@angular/core';
import { Router } from "@angular/router";
import { AngularFireAuth } from '@angular/fire/compat/auth';
import * as auth from 'firebase/auth';
import { DeviceDetectorService } from 'ngx-device-detector';

import { AngularFireDatabase } from '@angular/fire/compat/database';

import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';

import { User } from './user';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userState: any;
  errorCode: string = "";
  errorMessage: string = "";
  responseMessage: string = "";
  isLoading: boolean = false;
  actionCodeSettings;
  isEditingProfile = false;
  previous_deviceDetails;
  current_deviceDetails;

  constructor(
    private router: Router,
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private ngZone: NgZone,
    private db: AngularFireDatabase,
    private deviceService: DeviceDetectorService
  ) {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userState = user;
        localStorage.setItem('user', JSON.stringify(this.userState));
        JSON.parse(localStorage.getItem('user'))
        this.actionCodeSettings = {
          url: 'https://themontired.github.io/popmovies/?email=' + this.userState.email,
          handleCodeInApp: true,
        };
        //Update device info
        this.current_deviceDetails = this.deviceService.getDeviceInfo();
        console.log(this.current_deviceDetails);
      } else {
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'))
        this.router.navigate(['/']);
      }
    })
  }

  async SignIn(email: string, password: string) {
    this.isLoading = true;
    return this.afAuth
      .signInWithEmailAndPassword(email, password).then(user => {
        if (user) {
          this.userState = user;
          window.alert("last login: " + user.user.metadata.lastSignInTime);
          this.router.navigate(['dashboard']);
          //get current device
          //if !equal, send email
          //update new device
          this.addNewDevice()
          this.isLoading = false;
        }
      }).catch(error => {
        this.errorMessage = error.message;
        this.isLoading = false;
      });
  }


  async SignUp(email: string, password: string) {
    try {
      this.isLoading = true;
      const result = this.afAuth
        .createUserWithEmailAndPassword(email, password);
      this.SendVerificationMail();
      this.SetUserData((await result).user);
      this.isLoading = false;
    } catch (error) {
      this.ngZone.run(() => {
        this.isLoading = false;
        this.errorMessage = error.message;
      })
    }
  }

  async addNewDevice(){
    try {
      const userRef = this.db.list(this.userState.uid);
    userRef.push({ device: this.current_deviceDetails});
    } catch (error){
      this.errorMessage = error.message;
      console.error(error.message);
    }
  }

  setCurrentDevice(){

  }

  async SendVerificationMail() {
    this.isLoading = true;
    if (this.userState && !this.userState.verified) {
      return this.afAuth.currentUser
        .then((u) => u.sendEmailVerification(this.actionCodeSettings))
        .then(() => {
          this.ngZone.run(() => {
            this.isLoading = false;
            this.responseMessage = "We've sent an "
          });
        });
    } else {
      this.isLoading = false;
      this.ngZone.run(() => {
        this.responseMessage = "Your email has already been verified :-)"
      });
    }
  }

  GoogleAuth() {
    return this.AuthLogin(new auth.GoogleAuthProvider());
  }

  async AuthLogin(provider) {
    this.isLoading = true;
    return this.afAuth
      .signInWithPopup(provider)
      .then((result) => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.router.navigate(['dashboard']);
        });
        this.SetUserData(result.user);
      })
      .catch((error) => {
        this.isLoading = false;
        this.errorMessage = error.message;
      });
  }

  SetUserData(user) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    );
    const userState: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
    return userRef.set(userState, {
      merge: true,
    });
  }

  async ForgotPassword(passwordResetEmail) {
    this.isLoading = true;
    return this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        this.responseMessage = "An email with the reset link has been sent to your email"
      })
      .catch((error) => {
        this.isLoading = false
        this.responseMessage = error.message
      });
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return user !== null && user.emailVerified !== false ? true : false;
  }

  async SignOut() {
    this.isLoading = true;
    await this.afAuth.signOut().then(() => {
      this.isLoading = false;
      localStorage.removeItem('user');
     this.ngZone.run(()=>{
      this.router.navigate(['sign-in']);
     })
    }).catch(error => {
      this.isLoading = false;
      this.errorMessage = error.message;
    });
  }

  updateProfile(name: string) {
    this.isEditingProfile = false;
    this.isLoading = true;
    this.userState.updateProfile({
      displayName: name
    }).then(() => {
      this.isLoading = false;
      // Update successful
      // ...
    }).catch((error) => {
      this.isLoading = false;
      this.errorMessage = error.message;
    });
  }
}
