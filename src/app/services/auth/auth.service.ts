//Credit to https://remotestack.io/angular-firebase-authentication-example-tutorial/

import { Injectable, NgZone } from '@angular/core';
import { initializeApp } from "firebase/app";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { environment } from "../../../environments/environment"
import { AngularFireAuth } from '@angular/fire/compat/auth';
import * as auth from 'firebase/auth';

import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';

import { User } from './user';
import firebase from 'firebase/compat';
import { getAuth } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userState: any;
  errorCode: string = "";
  errorMessage: string = "";

  const auth = getAuth();

  constructor(
    public router: Router,
    public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
    public ngZone: NgZone
  ) {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userState = user;
        this.router.navigate(['dashboard']);
        localStorage.setItem('user', JSON.stringify(this.userState));
        JSON.parse(localStorage.getItem('user'))
      } else {
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'))
        this.router.navigate(['sign-in']);
      }
    })
  }

  async SignIn(email: string, password: string) {
    try {
      return this.afAuth
        .signInWithEmailAndPassword(email, password).then(user => {
          if (user) {
            this.userState = user;
            this.router.navigate(['dashboard']);
          }
        })

    } catch (error) {
      window.alert(error.message);
    }
  }

  async SignUp(email: string, password: string) {
    try {
      const result = this.afAuth
        .createUserWithEmailAndPassword(email, password);
      this.SendVerificationMail();
      this.SetUserData((await result).user);
    } catch (error) {
      window.alert(error.message);
    }
  }

  async SendVerificationMail() {
    if (this.userState) {
      return this.afAuth.currentUser
        .then((u) => u.sendEmailVerification())
        .then(() => {
          this.ngZone.run(() => {
            this.router.navigate(['sign-in']);
          });
        });
    } else {
      this.ngZone.run(() => {
        this.router.navigate(['sign-in']);
      });
    }
  }

  GoogleAuth() {
    return this.AuthLogin(new auth.GoogleAuthProvider());
  }

  async AuthLogin(provider) {
    return this.afAuth
      .signInWithPopup(provider)
      .then((result) => {
        this.ngZone.run(() => {
          this.router.navigate(['dashboard']);
        });
        this.SetUserData(result.user);
      })
      .catch((error) => {
        window.alert(error);
      });
  }

  SetUserData(user: firebase.User) {
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
    return this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        window.alert('Password reset email sent, check your inbox.');
      })
      .catch((error) => {
        window.alert(error);
      });
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return user !== null && user.emailVerified !== false ? true : false;
  }

  async SignOut() {
    await this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      window.location.reload();
      this.router.navigate(['sign-in']);
    }).catch(error => {
      alert(error.message);
    });
  }

  updateProfile() {

    this.userState.updateProfile({
      displayName: "Jane Q. User",
      photoURL: "https://example.com/jane-q-user/profile.jpg"
    }).then(() => {
      // Update successful
      // ...
    }).catch((error) => {
      // An error occurred
      // ...
    });
  }
}
