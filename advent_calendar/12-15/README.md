# アドベントカレンダー全部俺2019…をやりたかった

去年、[先輩がアドベントカレンダーを一人でしていた](https://medium.com/escle/%E3%82%A2%E3%83%89%E3%83%99%E3%83%B3%E3%83%88%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC%E5%85%A8%E9%83%A8%E4%BF%BA2018%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81-2b85619096ff)。面白そうだったけど、去年はネタがなかったしやらなかった。今年は何となくやりたいなと思っていたけど、気づいたら初日が終わってた！

なんか悔しいけど、やってみたい欲はあるので1日遅れで初めます。

# 本日のコンテキスト[認証画面の作成]

アドベントカレンダー全部俺2019...をやりたかった、の14日目です。
<br>今日は認証画面を作っていきます。

## 目次

1. [ページ作成](#ページ作成)
1. [moduleの整理](#moduleの整理)
1. [Service](#Service)
1. [認証画面](#認証画面)
1. [ガード](#ガード)
1. [おわりに](#おわりに)

## ページ作成

認証にかかわるページの作成を行います。また、認証後のページとしてルーム一覧画面に遷移させようと思うので今回まとめて作成しておきます。
<br>認証系の機能とポーカー周りの機能はそれぞれモジュールとしてまとめようと思うのでそれぞれのモジュールと、Firebaseの処理をまとめるServiceを作成します。

```
$ ionic g service auth/auth
$ ionic g module auth
$ ionic g page auth/signup
$ ionic g page auth/signin
# 遷移用のページを作成しておく
$ ionic g module poker
$ ionic g page poker/list
```

## moduleの整理

ページ作成時に作成される下記のファイルは不要になるので削除しておきます。
```
src/app/auth/signup/signup.module.ts
src/app/auth/signup/signup-routing.module.ts
src/app/auth/signin/signin.module.ts
src/app/auth/signin/signin-routing.module.ts
src/app/poker/list/list.module.ts
src/app/poker/list/list-routing.module.ts
```

モジュールをまとめる際に以下のようにRoutingを変更していきます。
- `app-routing` -> `auth`, `poker`
- `auth` -> `signup`, `signup`
- `poker` -> `list`

```typescript
// src/app/auth/auth.module.ts
  import { NgModule } from '@angular/core';
  import { CommonModule } from '@angular/common';
+ import { FormsModule } from '@angular/forms';
+ import { IonicModule } from '@ionic/angular';
+ import { Routes, RouterModule } from '@angular/router';
+ import { SignupPage } from './signup/signup.page';
+ import { SigninPage } from './signin/signin.page';

+ const routes: Routes = [
+   {
+     path: 'signup',
+     component: SignupPage
+   },
+   {
+     path: 'signin',
+     component: SigninPage
+   }
+ ];

  @NgModule({
-   declarations: [],
+   declarations: [SignupPage, SigninPage],
    imports: [
-     CommonModule
+     CommonModule,
+     FormsModule,
+     IonicModule,
+     RouterModule.forChild(routes)
    ]
  })
  export class AuthModule { }
```

```typescript
// src/app/poker/poker.module.ts
  import { NgModule } from '@angular/core';
  import { CommonModule } from '@angular/common';
+ import { FormsModule } from '@angular/forms';
+ import { IonicModule } from '@ionic/angular';
+ import { Routes, RouterModule } from '@angular/router';
+ import { ListPage } from './list/list.page';

+ const routes: Routes = [
+   {
+     path: 'list',
+     component: ListPage
+   }
+ ];

  @NgModule({
-   declarations: [],
+   declarations: [ListPage],
    imports: [
-     CommonModule
+     CommonModule,
+     FormsModule,
+     IonicModule,
+     RouterModule.forChild(routes)
    ]
  })
  export class PokerModule { }
```

```typescript
// src/app/app-routing.module.ts
・・・
const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)},
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then( m => m.AuthModule)
  },
  {
    path: 'poker',
    loadChildren: () => import('./poker/poker.module').then( m => m.PokerModule)
  },
];
・・・
```

これでモジュールの整理終わりです。
<br>ここまでくるとそれぞれの画面にアクセスできるようになります。(画面はデフォルトのページなのでヘッダのみですが)

## Service

認証周りのFirebaseに接続する処理を作成していきます。
といっても[アドベントカレンダー8日目の"Firebaseを使ってチャットアプリ②~ 認証ページの実装 ~"](https://github.com/yosshi-4989/advent_calender_2019/tree/master/advent_calendar/12-09)で作成したものをそのまま利用するの細かくは説明を入れません。

Fireaseと接続するためのパッケージは昨日インストールしてあるので、接続設定を行います。(firebaseConfigの設定は以前の記事を見てください。)

```typescript
// src/pp/app.module.ts
  ・・・
+ import { AngularFireModule } from '@angular/fire';
+ import { AngularFireAuthModule } from '@angular/fire/auth';
+ import { environment } from 'src/environments/environment';

  @NgModule({
    declarations: [AppComponent],
    entryComponents: [],
-   imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
+   imports: [
+     BrowserModule,
+     IonicModule.forRoot(),
+     AppRoutingModule,
+     AngularFireModule.initializeApp(environment.firebaseConfig),
+     AngularFireAuthModule
+   ],
・・・
```

サービスの実装の前にエラー文言のファイルを作成します。

```typescript
// src/app/auth/firebase.error.ts
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

それでは認証周りのServiceを実装します。

```typescript
// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { NavController, AlertController } from '@ionic/angular';
import { firebaseError } from './firebase.error';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    public afAuth: AngularFireAuth,
    public navController: NavController,
    public alertController: AlertController,
  ) { }

  // 登録して一覧ページへ遷移
  authSignUp(login: { email: string, password: string}) {
    return this.afAuth.auth
      .createUserWithEmailAndPassword(login.email, login.password)
      .then(() => this.navController.navigateForward('poker/list'))
      .catch(error => {
        this.alertError(error);
        throw error;
      });
  }
  // ログインして一覧ページへ遷移
  authSignIn(login: { email: string, password: string}) {
    return this.afAuth.auth
      .signInWithEmailAndPassword(login.email, login.password)
      .then(() => this.navController.navigateForward('poker/list'))
      .catch(error => {
        this.alertError(error);
        throw error;
      });
  }
  // ログアウトしてタイトル画面へ遷移
  authSignOut() {
    return this.afAuth.auth.signOut()
      .then(() => this.navController.navigateRoot('/'))
      .catch(error => {
        this.alertError(error);
        throw error;
      });
  }
  // アラートを表示
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
}
```

これでOKですね。

## ガード

現在ログインしていない状態でも全てのページが見れてしまうのでガードをかけていきます。
<br>ガードのルールは以下の通りです。
- タイトル画面: ルーティングなし
- 認証画面: ログイン済みの場合、一覧画面へリダイレクト
- 一覧画面: 未ログインの場合、タイトル画面へリダイレクト

```typescript
// src/app/app.module.ts
  import { AngularFireModule } from '@angular/fire';
  import { AngularFireAuthModule } from '@angular/fire/auth';
+ import { AngularFireAuthGuard } from '@angular/fire/auth-guard';
  import { environment } from 'src/environments/environment';
  ・・・
    providers: [
      StatusBar,
      SplashScreen,
+     AngularFireAuthGuard,
      { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
    ],
  ・・・
```

```typescript
// src/app/app-routing.module.ts
  import { NgModule } from '@angular/core';
  import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
+ import { redirectUnauthorizedTo, redirectLoggedInTo, AngularFireAuthGuard } from '@angular/fire/auth-guard';

+ // 未認証のユーザーのリダイレクト先を設定
+ const redirectUnauthorized = () => redirectUnauthorizedTo(['/']);
+ // 認証済みのユーザーのリダイレクト先を設定
+ const redirectLoggedIn = () => redirectLoggedInTo(['poker/list']);

  const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)},
    {
      path: 'auth',
-     loadChildren: () => import('./auth/auth.module').then( m => m.AuthModule)
+     loadChildren: () => import('./auth/auth.module').then( m => m.AuthModule),
+     canActivate: [AngularFireAuthGuard],
+     data: { authGuardPipe: redirectLoggedIn }
    },
    {
      path: 'poker',
-     loadChildren: () => import('./poker/poker.module').then( m => m.PokerModule)
+     loadChildren: () => import('./poker/poker.module').then( m => m.PokerModule),
+     canActivate: [AngularFireAuthGuard],
+     data: { authGuardPipe: redirectUnauthorized }
    },
  ];
  ・・・
```

以上で、ガードができました。未ログイン状態の動作検証は現時点でできます。

## 認証画面

それでは認証画面を作成していきます。見た目はそのまま実装していきます。

### ログイン画面へ遷移

まずタイトル画面のボタンからそれぞれの画面へ遷移するようにする。

```html
// src/app/home/home.page.html
  <ion-content color="success">
    <div class="ion-text-center ion-padding title-context">
      <div class="ion-text-center title-position">
        <img [src]="'assets/title-logo.png'">
      </div>
      <div class="ion-text-center ion-padding-top">
-       <ion-button shape="round">ログイン</ion-button>
+       <ion-button routerLink="/auth/signin" shape="round">ログイン</ion-button>
      </div>
      <div class="ion-text-center ion-padding-top">
-       <ion-button shape="round">ユーザー登録</ion-button>
+       <ion-button routerLink="/auth/signup" shape="round">ユーザー登録</ion-button>
      </div>
    </div>
  </ion-content>
```

### 登録画面

```typescript
// src/app/auth/signup/signup.module.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  loading = false;
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

  signUp() {
    this.loading = true;
    this.auth.authSignUp(this.login)
      .finally(() => this.loading = false);
  }
}
```

```html
// src/app/auth/signup/signup.module.html
<ion-header>
  <ion-toolbar>
    <ion-buttons slot="start">
      <ion-back-button defaultHref="/auth/signin"></ion-back-button>
    </ion-buttons>
    <ion-title>アカウント作成</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <form #f="ngForm" class="ion-padding" (submit)="signUp()">
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
      <ion-button type="submit" shape="round" [disabled]="!f.form.valid || loading">新規登録</ion-button>
    </div>
  </form>
</ion-content>
```

### ログイン画面

```typescript
// src/app/auth/signup/signup.module.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
})
export class SigninPage implements OnInit {
  loading = false;
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
    this.loading = true;
    this.auth.authSignIn(this.login)
      .finally(() => this.loading = false);
  }
}
```

```html
// src/app/auth/signup/signup.module.html
<ion-header>
  <ion-toolbar>
    <ion-buttons slot="start">
      <ion-back-button defaultHref="/"></ion-back-button>
    </ion-buttons>
    <ion-title>ログイン</ion-title>
  </ion-toolbar>
</ion-header>

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
      <ion-button type="submit" shape="round" [disabled]="!f.form.valid || loading">ログイン</ion-button>
    </div>
    <div class="ion-text-center ion-padding-top">
      <ion-button size="small" fill="clear" routerLink="/auth/signup">新規登録はこちら</ion-button>
    </div>
    
  </form>
</ion-content>
```

これで認証画面の実装が終わりました。

### ついでにログアウト機能の仮置き

動作確認用にログアウト機能を一覧画面に実装します。(後々削除予定)

```typescript
// src/app/poker/list/list.page.ts
  import { Component, OnInit } from '@angular/core';
+ import { AuthService } from 'src/app/auth/auth.service';

  @Component({
    selector: 'app-list',
    templateUrl: './list.page.html',
    styleUrls: ['./list.page.scss'],
  })
  export class ListPage implements OnInit {

-   constructor() { }
+   constructor(public auth: AuthService) { }

    ngOnInit() {
    }

+   signOut() {
+     this.auth.authSignOut();
+   }
  }
```

```html
// src/app/poker/list/list.page.html
・・・
<ion-content>
  <ion-list>
    <ion-item (click)="signOut()" button=true>
      <ion-label>ログアウト</ion-label>
    </ion-item>
  </ion-list>
</ion-content>
```

## おわりに

サンプルプロジェクトでも1日1機能だったから、今回もそうなるのは当たり前だよなぁ！？(錯乱)
ということで、1日1機能になりそうです。

復習しながらでも思ったより時間がかかることに気づく本日の作業でした。コードのコピペが多いので行数は多いが、内容は薄いです！
<br>明日はユーザープロフィールの登録画面なので、明日も復習回ですね。ただ、プロフィール画像はカメラだけでなく画像選択もできるようにしたいですね。できたらやります。

それではまた明日！

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
|12/14|[タイトル画面の作成 ~ 縦方向のdivの位置調整 ~](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-14)|
|12/15|[認証画面の作成](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-15)|
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


