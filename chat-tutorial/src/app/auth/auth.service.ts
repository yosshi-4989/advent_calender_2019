import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { NavController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    public afAuth: AngularFireAuth,
    public navController: NavController,
  ) { }

  authSignUp(login: { email: string, password: string}) {
    return this.afAuth.auth
      .createUserWithEmailAndPassword(login.email, login.password)
      .then(() => this.navController.navigateForward('/'))
      .catch(error => {
        throw error;
      });
  }
  authSignIn(login: { email: string, password: string}) {
    return this.afAuth.auth
      .signInWithEmailAndPassword(login.email, login.password)
      .then(() => this.navController.navigateForward('/'))
      .catch(error => {
        throw error;
      });
  }
  authSignOut() {
    return this.afAuth.auth.signOut()
      .then(() => this.navController.navigateRoot('auth/signin'))
      .catch(error => {
        throw error;
      });
  }

}
