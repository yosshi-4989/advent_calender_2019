# アドベントカレンダー全部俺2019…をやりたかった

去年、[先輩がアドベントカレンダーを一人でしていた](https://medium.com/escle/%E3%82%A2%E3%83%89%E3%83%99%E3%83%B3%E3%83%88%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC%E5%85%A8%E9%83%A8%E4%BF%BA2018%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81-2b85619096ff)。面白そうだったけど、去年はネタがなかったしやらなかった。今年は何となくやりたいなと思っていたけど、気づいたら初日が終わってた！

なんか悔しいけど、やってみたい欲はあるので1日遅れで初めます。

# 本日のコンテキスト[プロフィール編集画面の作成]

アドベントカレンダー全部俺2019...をやりたかった、の15日目です。
<br>今日はプロフィール編集画面を作っていきます。

## 目次

1. [前準備](#前準備)
1. [ページ作成](#ページ作成)
1. [moduleの整理](#moduleの整理)
1. [Service](#Service)
1. [プロフィール編集画面](#プロフィール編集画面)
1. [おわりに](#おわりに)

## 前準備

今回はカメラ機能を利用するためCapacitorの有効化とPWA Elementsをインストールします。

```
$ ionic integrations enable capacitor
$ npm install @ionic/pwa-elements
```

## ページ作成

プロフィール編集画面のページの作成と、FirebaseのDBと接続するServiceを作成していきます。また、このプロフィール編集画面はモーダルにするのでまとめるSharedモジュールも作成します。

```
$ ionic g module shared
$ ionic g page shared/profile
$ ionic g service shared/firestore
```

## moduleの整理

ページ作成時に作成される下記のファイルは不要になるので削除しておきます。
```
src/app/shared/profile/profile.module.ts
src/app/shared/profile/profile-routing.module.ts
```

`profile`ページへ`shared`モジュールからアクセスできるようにします。また、`app-routing`からprofileへのルーティングを削除します。

```typescript
// src/app/shared/shared.module.ts
  import { NgModule } from '@angular/core';
  import { CommonModule } from '@angular/common';
+ import { FormsModule } from '@angular/forms';
+ import { IonicModule } from '@ionic/angular';
+ import { ProfilePage } from './profile/profile.page';

  @NgModule({
-   declarations: [],
+   declarations: [ProfilePage],
    imports: [
-     CommonModule
+     CommonModule,
+     FormsModule,
+     IonicModule,
    ]
  })
  export class SharedModule { }
```

```typescript
// src/app/app-routing.module.ts
・・・
-   {
-     path: 'profile',
-     loadChildren: () => import('./shared/profile/profile.module').then( m => m.ProfilePageModule)
-   },
・・・
```

これでモジュールの整理終わりです。

## Service

ユーザー情報をFirebaseに保存する処理を作成していきます。
といっても[アドベントカレンダー9日目の"Firebaseを使ってチャットアプリ➂~ ユーザープロフィールの実装 ~"](https://github.com/yosshi-4989/advent_calender_2019/tree/master/advent_calendar/12-10)で作成したものを利用するの細かくは説明を入れません。

必要なモジュールをappに登録します。

```typescript
// src/main.ts
・・・
import { defineCustomElements } from '@ionic/pwa-elements/loader';
・・・
defineCustomElements(window);
```

```typescript
// src/app/app.module.ts
  ・・・
+ import { AngularFirestoreModule } from '@angular/fire/firestore';
・・・
  @NgModule({
    ・・・
    imports: [
      ・・・
+     AngularFirestoreModule,
    ],
・・・
```

Firestoreにユーザー情報を保存する処理を実装します。

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

最後にuidを取得する処理を`auth`サービスに追記します。

```typescript
// src/app/auth/auth.service.ts
  ・・・
  // uidを取得
  getUserId(): string {
    return this.afAuth.auth.currentUser.uid;
  }
  ・・・
```

これでOKですね。

## プロフィール編集画面

それではプロフィール編集画面のメイン部分の作成をします。まずは処理部分を作成します。

```typescript
// src/app/shared/profile/profile.page.ts
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { IUser, FirestoreService } from '../firestore.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
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
      // source: CameraSource.Photos,
    });
    this.photo = image && image.dataUrl; // 取得結果を格納
  }

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

プロフィール画面の見た目を整えつつ処理を呼び出します。

```html
// src/app/shared/profile/profile.page.html
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
      <ion-button (click)="updateProfile()" [disabled]="!f.form.valid || (!photo && !this.user.photoDataUrl)">登録</ion-button>
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

後は一覧画面に遷移したときに呼び出されるようにします。

```typescript
// src/app/poker/poker.module.ts
  ・・・
+ import { SharedModule } from '../shared/shared.module';
  ・・・
  @NgModule({
    declarations: [ListPage],
    imports: [
      CommonModule,
      FormsModule,
      IonicModule,
+     SharedModule,
      RouterModule.forChild(routes)
    ]
    ・・・
```

```typescript
// src/app/poker/list/list.module.ts
import { ModalController } from '@ionic/angular';
import { FirestoreService, IUser } from 'src/app/shared/firestore.service';
import { ProfilePage } from 'src/app/shared/profile/profile.page';
・・・
export class ListPage implements OnInit {

  uid: string;
  user: IUser;

  constructor(
    public modalController: ModalController,
    public auth: AuthService,
    public firestore: FirestoreService,
  ) {}

  async ngOnInit() {
    // authからuidを取得し、firestoreのデータを確認
    const user = await this.firestore.userInit( this.auth.getUserId() );
    if (!user) {
      // modalを作成
      const modal = await this.modalController.create({
        component: ProfilePage,
      });
      // modalを表示
      await modal.present();
      // モーダルが非表示になった時にも表示するメソッドを実行してユーザー情報を取得する
      modal.onWillDismiss().then(() => this.ionViewWillEnter());
    }
  }

  // ユーザ情報を取得
  async ionViewWillEnter() {
    this.uid = this.auth.getUserId();
    this.user = await this.firestore.userInit(this.uid);
  }
  ・・・
```

これで登録できるようになりました。

## おわりに

プロフィール画面ができました。結局画像はカメラからのみっす…。[いや、なんかドキュメントにはできる的なこと書いてるんですけど](#https://capacitor.ionicframework.com/docs/apis/camera#type-292)できなくて…。多分、アプリようにビルドしたらできるとかそんな感じなんかな？、って思ってます。ブラウザの機能ではないのでブラウザからはカメラのそれっぽいの出せますよ的な。(Netlifyにデプロイしたチャットアプリにスマホからアクセスしたけどダメだったし、アプリにビルドするまでいかないとだめかそもそも勘違いの可能性まである)

うーん、カメラ機能どうしようかな。別のにするのもあり。
<br>明日はカメラを変えるかルーム一覧画面を作ります。(未定)

ではまた明日！

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
|12/16|[プロフィール編集画面の作成](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-16)|
|12/17|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-17)|
|12/18|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-18)|
|12/19|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-19)|
|12/20|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-20)|
|12/21|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-21)|
|12/22|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-22)|
|12/23|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-23)|
|12/24|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-24)|
|12/25|[終わってみて？](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-25)|


