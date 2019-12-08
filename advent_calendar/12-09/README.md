# アドベントカレンダー全部俺2019…をやりたかった

去年、[先輩がアドベントカレンダーを一人でしていた](https://medium.com/escle/%E3%82%A2%E3%83%89%E3%83%99%E3%83%B3%E3%83%88%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC%E5%85%A8%E9%83%A8%E4%BF%BA2018%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81-2b85619096ff)。面白そうだったけど、去年はネタがなかったしやらなかった。今年は何となくやりたいなと思っていたけど、気づいたら初日が終わってた！

なんか悔しいけど、やってみたい欲はあるので1日遅れで初めます。

# 本日のコンテキスト[Firebaseを使ってチャットアプリ②~ 認証ページの実装 ~]

今日からチャットアプリを作っていきます。当初想定では2日とか適当においてたけど、内容の意味で切りのいいようにするために4日に分割します！(やったね！)

そんなわけで、今日はIonicのアプリケーションからFirebaseにアクセスできるようにする方法をまとめていきます！

## 目次

1. [認証ページの作成](#認証ページの作成)
1. [認証ページのモックアップ作成](#認証ページのモックアップ作成)
1. [認証機能の作成](#認証機能の作成)
1. [認証エラーハンドリング](#認証エラーハンドリング)
1. [おわりに](#おわりに)

## 認証ページの作成

ログインと登録用の画面を作成してく。sign_inの画面とsign_upの画面、認証周りをまとめるモジュールを作成する。

```
$ ionic g page auth/signup
$ ionic g page auth/signin
$ ionic g module auth
```

`signin`と`signup`のページへ`auth`モジュールからアクセスできるようにする。

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SignupPage } from './signup/signup.page';
import { SigninPage } from './signin/signin.page';
// signin, signoutで利用しているモジュールもimportしておく
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

const routes: Routes = [
  {
    path: 'signup',
    component: SignupPage
  },
  {
    path: 'signin',
    component: SigninPage
  }
];

@NgModule({
  declarations: [SignupPage, SigninPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ]
})
export class AuthModule { }
```

これで`signup`と`signin`のページへ`auth`から接続できるようになったので、`src/app/app-routing.modult.ts`からのルーティング(`routes`)を`auth`に変更する。

```typescript
const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then( m => m.AuthModule)
  }
];
```

以上で`signin`と`signup`のモジュールが不要になったので、それぞれのモジュールとroutingモジュールを削除する。
これでモジュールの整理ができたので、モックアップ作成に移る。

## 認証ページのモックアップ作成

`signup`と`signin`ページの見た目を整えていく。見た目はこんな感じ。(HTMLの編集のみなので詳細は省略)
ちなみにログインボタンを押すとトップ画面に移動する。

![ログインページ](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-09/images/signin-page.png)

最後に、トップ画面から`signin`ページに遷移するためのログアウトボタンを付ければ動作確認できるモックアップができた。

## 認証機能の作成

では、実際にログイン認証を行う機能を作成していく。

### Firebaseの管理機能を有効化

FirebaseコンソールのAuthenticationへ遷移し、「ログイン方法を設定」から必要なログイン方法を有効化する。今回は「メール/パスワード」(メールリンクなし)のみ利用する。
行こうになっていればOK。

### アクセス制御

それではまず、ログイン状態によってアクセスできるページの振り分けする機能を作る。Angularには「ガード」という機能で条件を満たしている場合のみルーティングを有効化できる。`@angular/firebase`では`AngularFireAuthGuard`オブジェクトをガードとして用意されているようなので、これを利用してみる。

まず、`src/app/app.module.ts`を追加する。

```typescript
・・・
import { AngularFireAuthGuard } from '@angular/fire/auth-guard';
・・・
  providers: [
    StatusBar,
    SplashScreen,
    AngularFireAuthGuard,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
・・・
```

そして`src/app/app-routing.module.ts`で実際にルーティングを管理する。

```typescript
import { AngularFireAuthGuard, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';

// 未認証時に遷移するURLを設定
const redirectUnauthorised = () => redirectUnauthorizedTo(['auth/signin']);
// 認証時に遷移するURLを設定
const redirectLoggedIn = () => redirectLoggedInTo(['/']);

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [AngularFireAuthGuard],
    data: {authGuardPipe: redirectUnauthorised},
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then( m => m.AuthModule),
    canActivate: [AngularFireAuthGuard],
    data: {authGuardPipe: redirectLoggedIn}
  }
];
```

これで`/`へは現在ログインできない状態になりました。

### 認証処理の実装

Authenticationへの接続はサービスを利用するので、`auth/auth`のサービスを作る。

```
$ ionic g service auth/auth
```

そして、登録、ログイン、ログアウトするメソッドを追加しておく。

```typescript
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
```

そして、各ページにこのメソッドを呼び出すようにする。(例として`signin`のみ記載する)

```typescript:src/app/auth/signin/signin.page.ts
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
```

```html:src/app/auth/signin/signin.page.html
・・・
<ion-content>
  <form #f="ngForm" class="ion-padding" (submit)="signIn()">
    <ion-list class="ion-no-margin">
      <ion-item>
        <ion-label position="floating">メールアドレス</ion-label>
        <ion-input type="email" required [(ngModel)]="login.email" name="email"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="floating">パスワード</ion-label>
        <ion-input type="password" required [(ngModel)]="login.password" name="email"></ion-input>
      </ion-item>
    </ion-list>
    <div class="ion-text-center ion-padding-top">
      <ion-button type="submit" shape="round" [disabled]="!f.form.valid">ログイン</ion-button>
    </div>
    <div class="ion-text-center ion-padding-top">
      <ion-button size="small" fill="clear" routerLink="/auth/signup">新規登録はこちら</ion-button>
    </div>
  </form>
</ion-content>
```

これで登録、ログイン、ログアウトができるようになったはずなので動作確認してみて、ちゃんと動作すればOK。
<br>※まだエラー処理は実装されていないので未登録とかパスワードミスとかでログインしてもなにも起こらない。

## 認証エラーハンドリング

認証に失敗したときの処理がないため現状だと何も表示されないので、エラーが発生したときにエラー文言を表示するようにする。

```typescript
・・・
import { NavController, AlertController } from '@ionic/angular';
・・・
  constructor(
    public afAuth: AngularFireAuth,
    public navController: NavController,
    public alertController: AlertController,
  ) { }

  authSignUp(login: { email: string, password: string}) {
      ・・・
      .catch(error => {
        this.alertError(error);
        throw error;
      });
  }
  authSignIn(login: { email: string, password: string}) {
      ・・・
      .catch(error => {
        this.alertError(error);
        throw error;
      });
  }
  authSignOut() {
      ・・・
      .catch(error => {
        this.alertError(error);
        throw error;
      });
  }

  async alertError(e) {
    const alert = await this.alertController.create({
      header: e.code,
      message: e.message,
      buttons: ['閉じる'],
    });
    await alert.present();
  }
```

このままだとエラー文が英語で表示されるので、日本語で表示するように変更する。

```typescript
// src/auth/firebase.error.tsを作成してエラーメッセージを格納
export const firebaseError = {
  'auth/invalid-email': {
    code: 'メールアドレスが間違っています',
    message: 'メールアドレスのフォーマットが間違っています。',
  },
  'auth/wrong-password': {
    code: 'パスワードが間違っています',
    message: '入力いただいたパスワードが間違っています。',
  },
  'auth/weak-password': {
    code: '脆弱性があります',
    message: 'パスワードは最低でも6文字以上のものをご利用ください。',
  },
  'auth/user-not-found': {
    code: 'ユーザが見つかりません',
    message: '入力いただいたユーザは存在しません。',
  },
  'auth/email-already-in-use': {
    code: 'ユーザが存在しています',
    message: 'このメールアドレスを利用してすでにユーザが作成されています。',
  },
};
```

```typescript
// src/app/auth/auth.service.ts
・・・
import { firebaseError } from './firebase.error';
・・・
  async alertError(e) {
    if (firebaseError.hasOwnProperty(e.code)) {
      e = firebaseError[e.code];
    }
    const alert = await this.alertController.create({
      header: e.code,
      message: e.message,
      buttons: ['閉じる'],
    });
    await alert.present();
  }
```

これでエラーメッセージの日本語化ができた。

## おわりに

これで認証ページの実装は完了です。思ったより量が多かったんで、日を分けてよかった。

認証周りはFirebaseに任せてしまっているので実装が楽ですね。ログイン情報も任せられるとは思わなかったです。やっぱりFirebaseは便利だ。

さて、明日はユーザープロフィールの実装を進めていきます。ページ数としては認証ページよりも少ないから楽になる…はず？頑張ります。

# アドベントカレンダー

|日付|タイトル|
|-----|------|
|12/02|[アドベントカレンダーやる宣言](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-02)|
|12/03|[Ionic環境構築](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-03)|
|12/04|[Ionicアプリが表示されるまでと最初のサンプルプロジェクト](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-04)|
|12/05|[WordPressと連携してみる](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-05)|
|12/06|[リファクタリングしよう！](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-06)|
|12/07|[~~Capacitorを使ってみる~~JSの非同期処理](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-07)|
|12/08|[Firebaseを使ってチャットアプリ➀~ Firebaseとの連携 ~](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-08)|
|12/09|[Firebaseを使ってチャットアプリ➁~ 認証ページの実装 ~](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-09)|
|12/10|[Firebaseを使ってチャットアプリ➂~ ユーザープロフィールの実装 ~](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-10)|
|12/11|[Firebaseを使ってチャットアプリ➃~ チャットの実装 ~](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-11)|
|12/12|[自動デプロイと書籍を終えて](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-12)|
|12/13|[プランニングポーカー事始め](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-13)|
|12/14|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-14)|
|12/15|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-15)|
|12/16|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-16)|
|12/17|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-17)|
|12/18|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-18)|
|12/19|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-19)|
|12/20|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-20)|
|12/21|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-21)|
|12/22|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-22)|
|12/23|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-23)|
|12/24|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-24)|
|12/25|[終わってみて？](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-25)|


