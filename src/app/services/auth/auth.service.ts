//Credit to https://remotestack.io/angular-firebase-authentication-example-tutorial/

import { Injectable, NgZone } from '@angular/core';
import { Router } from "@angular/router";
import { AngularFireAuth } from '@angular/fire/compat/auth';
import * as auth from 'firebase/auth';

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
 

  constructor(
    public router: Router,
    public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
    public ngZone: NgZone
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
      } else {
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'))
      }
    })
  }

  async SignIn(email: string, password: string) {
    this.isLoading = true;
    return this.afAuth
      .signInWithEmailAndPassword(email, password).then(user => {
        if (user) {
          this.userState = user;
          this.router.navigate(['dashboard']);
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
    }).catch(error => {
      this.isLoading = false;
      this.errorMessage = error.message;
    });
  }

  editProfile(name: string, photoURL: string) {
    this.isEditingProfile = true;
    this.userState.updateProfile({
      displayName: name,
      photoURL: photoURL
    }).then(() => {
      this.isEditingProfile = true;
      // Update successful
      // ...
    }).catch((error) => {
      this.isEditingProfile = true;
     this.errorMessage = error.message;
    });
  }
}
