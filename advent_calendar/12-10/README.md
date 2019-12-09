# アドベントカレンダー全部俺2019…をやりたかった

去年、[先輩がアドベントカレンダーを一人でしていた](https://medium.com/escle/%E3%82%A2%E3%83%89%E3%83%99%E3%83%B3%E3%83%88%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC%E5%85%A8%E9%83%A8%E4%BF%BA2018%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81-2b85619096ff)。面白そうだったけど、去年はネタがなかったしやらなかった。今年は何となくやりたいなと思っていたけど、気づいたら初日が終わってた！

なんか悔しいけど、やってみたい欲はあるので1日遅れで初めます。

# 本日のコンテキスト[Firebaseを使ってチャットアプリ➂~ ユーザープロフィールの実装 ~]

「アドベントカレンダー全部俺2019…をやりたかった」の9日目です。
今日はユーザープロフィール画面を作っていきます。ちなみにプロフィール画像の登録でCapacitorのカメラ機能を利用するっぽいので飛ばさなかったほうがよかったかなとちょっと後悔。

## 目次

1. [前準備](#前準備)
1. [カメラの準備](#カメラの準備)
1. [プロフィール画面のモックアップ](#プロフィール画面のモックアップ)
1. [プロフィール登録処理の実装](#プロフィール登録処理の実装)
1. [おわりに](#おわりに)

## 前準備(Firebaseの設定)

プロフィールデータはFirebaseのCloud Firestoreに格納するので、FirebaseでCloud Firestoreの有効化とアプリケーションにモジュールの追加を行います。

Firebaseのコンソールから、「Database」へ遷移→データベースの作成→「Cloud Firestoreのセキュリティー保護ルール」でテストモードで開始を選択→ロケーションで「asia-northeast1」(東京リージョン)を選択、で作成する。これでFirebase側の準備は完了なので、`app.module.ts`でFirestoreにアクセスできるようにモジュールを追加する。

```typescript
// src/app/app.module.ts
・・・
import { AngularFirestoreModule } from '@angular/fire/firestore';
・・・
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
  ],
・・・
```

## カメラの準備

次に、プロフィール画像はカメラで設定できるようにするのでCapacitorの有効化とPWA-ELEMENTのインストールをします。

```
$ ionic integrations enable capacitor
$ npm install @ionic/pwa-elements
```

インストールしたPWA-ELEMENTを`src/main.ts`で読み込みます。

```typescript
・・・
import { defineCustomElements } from '@ionic/pwa-elements/loader';
・・・
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
defineCustomElements(window);
```

これでカメラの準備はOK。

## プロフィール画面のモックアップ

それではプロフィール登録画面のモックアップを作成します。登録画面はモーダルウィンドウで表示するそうです。モーダルウィンドウは使いまわしができるので、ルーティングなしのモジュール(`sharedModule`)にします。そして、モジュールの中のページの一つに`profile`を作ります。

```
$ ionic g module shared
$ ionic g page shared/profile
```

ページが作成できたら、自動で付与されるルーティングは不要なので`src/app/app-routing.module.ts`から削除する。
(`src/app/shared/profile/profile-routing.module.ts`も不要です。)


```typescript
・・・
-   {
-     path: 'profile',
-     loadChildren: () => import('./shared/profile/profile.module').then( m => m.ProfilePageModule)
-   }
・・・
```

`prifile`は`sharedModule`から呼び出すので`src/app/shared/profile/profile.module.ts`は削除し。`src/app/shared/shared.module.ts`に追加する。

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ProfilePage } from './profile/profile.page';

@NgModule({
  declarations: [ProfilePage],
  entryComponents: [ProfilePage], // これなんだろう？exports？
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ]
})
export class SharedModule { }
```

ここまで出来たらログイン後に遷移するTab1に登録画面が表示されるようにする。

```typescript
// src/app/tab1/tab1.module.ts
・・・
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    SharedModule, // モーダルのモジュールを読み込む
    RouterModule.forChild([{ path: '', component: Tab1Page }])
  ],
・・・
```

```typescript
// src/app/tab1/tab1.page.ts
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ProfilePage } from '../shared/profile/profile.page';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  constructor(
    public modalController: ModalController,
  ) {}

  async ngOnInit() {
    // modalを作成
    const modal = await this.modalController.create({
      component: ProfilePage,
    });
    // modalを表示
    await modal.present();
  }
}
```

これでサーバーを起動してログインするとモーダルウィンドウが表示されるようになった。

続いて、モーダルウィンドウの中身を作っていく。

```html
<!-- src/app/shared/profile/profile.page.html -->
<ion-header>
  <ion-toolbar>
    <!-- モーダル非表示にするボタン -->
    <ion-buttons slot="start">
      <ion-button (click)="modalDismiss()">
        <ion-icon name="close" slot="icon-only"></ion-icon>
      </ion-button>
    </ion-buttons>
    <ion-title>プロフィール</ion-title>
    <!-- 登録(未実装)ボタン -->
    <ion-buttons slot="end">
      <ion-button>登録</ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content>
  <!-- アイコン表示 -->
  <div class="ion-text-center ion-padding">
    <ion-avatar style="display: inline-block;">
      <!-- 画像→登録画像→デフォルト画像　の順で表示する -->
      <img [src]="photo || user.photoDataUrl || 'assets/shapes.svg'">
    </ion-avatar>
  </div>
  <div class="ion-text-center">
    <!-- 新規画像を撮るボタン(押すとカメラが表示される) -->
    <ion-button fill="clear" size="small" (click)="takePicture()">画像変更</ion-button>
  </div>
  <!-- ユーザー情報入力欄 -->
  <form #f="ngForm">
    <ion-list class="ion-padding">
      <ion-item>
        <ion-label position="floating">ユーザID</ion-label>
        <ion-input type="text" [value]="uid" disabled></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="floating">表示名</ion-label>
        <ion-input type="text" [(ngModel)]="user.displayName" name="displayName" required></ion-input>
      </ion-item>
    </ion-list>
  </form>
</ion-content>
```

```typescript
// src/app/shared/profile/profile.page.ts
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Plugins, CameraResultType } from '@capacitor/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  uid: string;
  // ユーザー情報
  user = {
    displayName: null,
    photoDataUrl: null,
  };
  photo: string; // 撮影したデータを格納する

  constructor(
    public modalController: ModalController,
  ) { }

  ngOnInit() {
  }

  // モーダルを閉じる
  modalDismiss() {
    this.modalController.dismiss();
  }

  // 画像を撮る
  async takePicture() {
    const image = await Plugins.Camera.getPhoto({
      quality: 100, // 画像の最高画質
      resultType: CameraResultType.DataUrl, // 出力形式をBase64文字列に指定
    });
    this.photo = image && image.dataUrl; // 取得結果を格納
  }
}
```

これでモックアップは完成。動かしてみるとモーダルの非表示やユーザー名の入力、画像の変更まで出来るようになっている。
※画像変更をキャンセルするとエラーになるけど、エラー処理はしない？

## プロフィール登録処理の実装

モックアップができたので、ユーザーが入力した情報を登録する処理を作成する。

まず、Firebaseと接続するサービスを作成して、次に登録する処理を作る。

```
$ ionic g service shared/firestore
```

```typescript
// src/app/shared/firestore.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { first } from 'rxjs/operators';

export interface IUser {
  displayName: string;
  photoDataUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  userDoc: AngularFirestoreDocument<IUser>;

  constructor(public af: AngularFirestore) { }

  // ユーザー情報(userDoc)を初期化するメソッド
  userInit(uid: string): Promise<IUser> {
    // users/[uid]/[IUser型データ] の形で保存する
    this.userDoc = this.af.doc<IUser>('users/' + uid);
    return this.userDoc.valueChanges()
      .pipe(first())
      .toPromise(Promise);
  }

  // ユーザー情報を更新する
  userSet(user: IUser): Promise<void> {
    return this.userDoc.set(user);
  }
}
```

これでFirestoreとの接続はできた。これを利用するには`uid`を取得しないといけないのでAuthenticationからログイン中のユーザーIDを取得するメソッドを作成する。

```typescript
// src/app/auth/auth.service.ts
  getUserId(): string {
    return this.afAuth.auth.currentUser.uid;
  }
```

これで`uid`も取得できるようになったので、`profile`で読み込んで更新するまでのメソッドを作成する。

```typescript
・・・
import { IUser, FirestoreService } from '../firestore.service';
import { AuthService } from 'src/app/auth/auth.service';
・・・
export class ProfilePage implements OnInit {
  uid: string;
  // ユーザー情報
  user: IUser = {
    displayName: null,
    photoDataUrl: null,
  };
  photo: string; // 撮影したデータを格納する

  constructor(
    public modalController: ModalController,
    public auth: AuthService,
    public firestore: FirestoreService,
  ) { }
・・・
  // 画面描画時にuidとuserを初期化する
  async ionViewWillEnter() {
    this.uid = this.auth.getUserId();
    const user = await this.firestore.userInit(this.uid);
    if (user) {
      this.user = user;
    }
  }

  // ユーザー情報を更新してモーダルを閉じる
  async updateProfile() {
    // 画像が更新されていたら保存する
    if (this.photo) {
      this.user.photoDataUrl = this.photo;
    }
    // ユーザー情報の更新
    await this.firestore.userSet(this.user);
    // モーダルを閉じる
    this.modalController.dismiss();
  }
}
```

これで更新処理までできたので、最後にHTML側で登録ボタンを押したときにユーザー情報を更新するようにすれば完成！

```html
<!-- src/app/shared/profile/profile.page.html -->
・・・
      <!-- 登録(未実装)ボタン -->
      <ion-buttons slot="end">
-       <ion-button>登録</ion-button>
+       <ion-button (click)="updateProfile()" [disabled]="!f.form.valid || (!photo && !this.user.photoDataUrl)">登録</ion-button>
      </ion-buttons>
・・・
```

## おわりに

はい、これでユーザーのプロフィール登録画面の終了！
わかっていればサッと実装できるけど、知らないと自分では時間をかけまくってしまいそうな気がするこの頃。こういうお手本に触れることができるのはすごくいいですね。

明日はついにチャットページの実装です。それっぽいものができてきていてワクワクする反面、プランニングポーカーにどう適用させるか！悩みどころですな！明日も頑張ります。

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


