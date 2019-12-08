import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
})
export class SigninPage implements OnInit {
  login: {
    email: string,
    password: string,
  } = {
    email: null,
    password: null,
  };

  constructor(public auth: AuthService) { }

  ngOnInit() {
  }

  signIn() {
    this.auth.authSignIn(this.login);
  }
}
