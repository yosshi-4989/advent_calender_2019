# アドベントカレンダー全部俺2019…をやりたかった

去年、[先輩がアドベントカレンダーを一人でしていた](https://medium.com/escle/%E3%82%A2%E3%83%89%E3%83%99%E3%83%B3%E3%83%88%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC%E5%85%A8%E9%83%A8%E4%BF%BA2018%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81-2b85619096ff)。面白そうだったけど、去年はネタがなかったしやらなかった。今年は何となくやりたいなと思っていたけど、気づいたら初日が終わってた！

なんか悔しいけど、やってみたい欲はあるので1日遅れで初めます。

# 本日のコンテキスト[ルーム一覧画面の作成]

アドベントカレンダー全部俺2019...をやりたかった、の17日目です。
<br>今日は一覧画面を作成していきます。

## 目次

1. [見た目の調整](#見た目の調整)
1. [ルーム一覧表示](#ルーム一覧表示)
1. [プレイルームページの作成(画面遷移前準備)](#プレイルームページの作成(画面遷移前準備))
1. [画面遷移](#画面遷移)
1. [おわりに](#おわりに)

## 見た目の調整

一覧ページの背景色を決めていきます。

タイトル画面を作成するときに、`<ion-content>`のオプションで`color="success"`をさらっと使用していましたが、これは`src/theme/variables.scss`で定義されているIonicアプリのテーマカラーとなります。このテーマカラーを追加して、一覧ページ(とついでにログイン画面)の背景色を変更していきます。

テーマカラーの追加にはいろいろ設定しないといけないことがありますが、[Ionicのドキュメントの配色に関するページ内](https://ionicframework.com/jp/docs/theming/colors#new-color-creator)で、作りたい色と名前を入力するとコピペすればよいコードを生成してくれます。

![New Color Creator](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-18/images/new-color-creator.png)

精製されたコードを書き込んでいきます。

```scss
// src/theme/variables.scss
  :root {
    ・・・
+   --ion-color-playmat: #02a57a;
+   --ion-color-playmat-rgb: 2,165,122;
+   --ion-color-playmat-contrast: #ffffff;
+   --ion-color-playmat-contrast-rgb: 255,255,255;
+   --ion-color-playmat-shade: #02916b;
+   --ion-color-playmat-tint: #1bae87;
  }

+ .ion-color-playmat {
+   --ion-color-base: var(--ion-color-playmat);
+   --ion-color-base-rgb: var(--ion-color-playmat-rgb);
+   --ion-color-contrast: var(--ion-color-playmat-contrast);
+   --ion-color-contrast-rgb: var(--ion-color-playmat-contrast-rgb);
+   --ion-color-shade: var(--ion-color-playmat-shade);
+   --ion-color-tint: var(--ion-color-playmat-tint);
+ }
```

では早速使ってみましょう。

```html
// src/app/poker/list.list.page.html
    <!-- the main content -->
    <ion-content id="menu-content">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
          <ion-title>list</ion-title>
        </ion-toolbar>
      </ion-header>

-     <ion-content>
+     <ion-content color="playmat">
      </ion-content>
    </ion-content>
```

こんな風になりました。

![一覧画面の背景色の変更](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-18/images/list-page.png)

ついでにタイトル画面も変更しましょう。

![タイトル画面の背景色の変更](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-18/images/title-page.png)

お！思ったよりそれっぽくなった？ええやん。

せっかくなのでヘッダも統一して文字色(contrastを参照している模様)をタイトルの文字色に近くしてみる。(ついでにヘッダのタイトルも変更しておく)

```scss
// src/theme/variables.scss
  :root {
    ・・・
    --ion-color-playmat: #02a57a;
    --ion-color-playmat-rgb: 2,165,122;
-   --ion-color-playmat-contrast: #ffffff;
-   --ion-color-playmat-contrast-rgb: 255,255,255;
+   --ion-color-playmat-contrast: #f7f700;
+   --ion-color-playmat-contrast-rgb: 247,247,0;
    --ion-color-playmat-shade: #02916b;
    --ion-color-playmat-tint: #1bae87;
  }
```
```html
// src/app/poker/list.list.page.html
    <!-- the main content -->
    <ion-content id="menu-content">
      <ion-header>
-       <ion-toolbar>
+       <ion-toolbar color="playmat">
          <ion-buttons slot="start">
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
-         <ion-title>list</ion-title>
+         <ion-title>ルーム一覧</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content color="playmat">
      </ion-content>
    </ion-content>
```

![ヘッダの色の変更](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-18/images/list-page2.png)

うーん？やりすぎちゃったかな？まぁいいか。いったんこれで行ってみます！

## ルーム一覧表示

それではルーム一覧を画面に表示する処理を作成していきましょう。

事前に以下の構成でルームを作成しておきます。
```
room/
  {roomId}/
    - createDate: [number]
    - roomName: [name]
```

では処理の作成に移ります。
<br>まずFirebaseに登録されているルームリストを取得する処理を作ります。

```typescript
// src/app/shared/firebase.service.ts
  import { Injectable } from '@angular/core';
- import { AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
+ import { AngularFirestoreDocument, AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
  import { first } from 'rxjs/operators';
+ import { Observable } from 'rxjs';
  ・・・
+ export interface IRoomInfo {
+   roomName: string;
+   createDate: number;
+ }

+ export interface IRoom extends IRoomInfo {
+   roomId: string;
+ }

  ・・・
  export class FirestoreService {
    userDoc: AngularFirestoreDocument<IUser>;
+   roomCollection: AngularFirestoreCollection<IRoomInfo>;

-   constructor(public af: AngularFirestore) { }
+   constructor(public af: AngularFirestore) {
+     this.roomCollection = this.af.collection<IRoomInfo>('room', ref => ref.orderBy('createDate', 'desc'));
+   }
    ・・・
+   roomListInit(): Observable<IRoom[]> {
+     return this.roomCollection.valueChanges({idField: 'roomId'});
+   }
  }
```

次に、一覧ページからリストを参照できるようにします。

```typescript
// src/app/poker/list/list.page.ts
・・・
  import { AuthService } from 'src/app/auth/auth.service';
- import { FirestoreService, IUser } from 'src/app/shared/firestore.service';
+ import { FirestoreService, IUser, IRoom } from 'src/app/shared/firestore.service';
  import { ProfilePage } from 'src/app/shared/profile/profile.page';
+ import { Observable } from 'rxjs';
  ・・・
  export class ListPage implements OnInit {

    uid: string;
    user: IUser;
+   roomList: Observable<IRoom[]>;
    ・・・
    async ngOnInit() {
      ・・・
+     this.roomList = this.firestore.roomListInit();
    }
```

最後に取得したルーム一覧を表示する。

```html
// src/app/poker/list/list.page.html
    ・・・
    <!-- the main content -->
-   <ion-content id="menu-content">
+   <ion-content id="menu-content" scrollY="false"> <!-- このレベルでY方向のスクロールは不要なので外す -->
      <ion-header>
        <ion-toolbar color="playmat">
          <ion-buttons slot="start">
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
          <ion-title>ルーム一覧</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content color="playmat">
+       <ion-card color="primary" *ngFor="let room of roomList | async; trackBy: trackByFn">
+         <ion-card-content>
+           <strong>{{room.roomName}}</strong>
+         </ion-card-content>
+       </ion-card>
      </ion-content>
    </ion-content>
```

これで出来上がりです。

![ヘッダの色の変更](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-18/images/list-page3.png)

ボタンの見た目が強くてヘッダが弱く見えてしまう…かな？

## プレイルームページの作成(画面遷移前準備)

ルーム一覧からルームを選択して遷移する処理を作成していきたいと思いますが、そのためにはルームページを作成する必要があるので、遷移実装前に作成しておきます。

```
$ ionic g page poker/room
```

いつも通り、不要なファイルを削除して自動で追加されたルーティングを削除しておきます。(ついでにリストをpokerのルートにしておく)

```
$ rm src/app/poker/room/room-routing.module.ts src/app/poker/room/room.module.ts
```

```typescript
// src/app/app-routing.module.ts
  ・・・
  // ついでにルーティングの修正
- const redirectLoggedIn = () => redirectLoggedInTo(['poker/list']);
+ const redirectLoggedIn = () => redirectLoggedInTo(['poker']);
  ・・・
-   {
-     path: 'room',
-     loadChildren: () => import('./poker/room/room.module').then( m => m.RoomPageModule)
-   },
```

最後に、pokerのモジュールにルーティングを追加する。(ついでにリストをpokerのルートにしておく)

```typescript
// src/app/poker/poker.module.ts
  ・・・
  import { RoomPage } from './room/room.page';

  const routes: Routes = [
    {
-     path: 'list',
+     path: '',
      component: ListPage
-   }
+   },
+   {
+     path: ':roomId', // roomIdで引数を受け渡す設定
+     component: RoomPage
+   }
  ];

  @NgModule({
-   declarations: [ListPage],
+   declarations: [ListPage, RoomPage],
    ・・・
```

routingでroomIdを受け渡すように変更したので、room側で受け取れるようにします。

```typescript
  import { Component, OnInit } from '@angular/core';
+ import { ActivatedRoute, ParamMap } from '@angular/router';

  @Component({
    selector: 'app-room',
    templateUrl: './room.page.html',
    styleUrls: ['./room.page.scss'],
  })
  export class RoomPage implements OnInit {
+   roomId: string;

-   constructor() { }
+   constructor(public route: ActivatedRoute) { }

    ngOnInit() {
+     this.route.paramMap.subscribe((params: ParamMap) => this.roomId = params.get('roomId'));
    }

  }
```

検証用にroomIdを確認できるようにしておきます。

```html
<ion-header>
  <ion-toolbar>
    <ion-buttons slot="start">
      <ion-back-button defaultHref="/poker"></ion-back-button>
    </ion-buttons>
    <ion-title>room</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  {{roomId}}
</ion-content>
```

これで /poker/[roomId]で接続してroomIdが表示されればOKです。

## 画面遷移

最後にルーム一覧から選択したルームに遷移できるようにして終わります。

```html
    <ion-content color="playmat">
-     <ion-card button="true" color="primary" *ngFor="let room of roomList | async; trackBy: trackByFn">
+     <ion-card button="true" color="primary" *ngFor="let room of roomList | async; trackBy: trackByFn" routerLink="/poker/{{room.roomId}}">
        <ion-card-content>
          <strong>{{room.roomName}}</strong>
        </ion-card-content>
      </ion-card>
    </ion-content>
```

これでそれぞれのroomIdが表示されるページに遷移できれば完成です！

## おわりに

これでルーム一覧画面の作成が終わりました！あとはプランニングポーカーを遊ぶページを作ればとりあえず遊べるものができますね！
<br>何とかアドベントカレンダー中に完成ができそうでちょっと安心している反面、気を抜くと毎日更新に失敗するかもなので引き締めていきます！
<br>明日はプランニングポーカーの実装に入る前に、カードのコンポーネントを作成してみようかなと思ってます。

以上！それではまた明日！

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
|12/17|[Split Paneでメニューを実装してみる！](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-17)|
|12/18|[ルーム一覧画面の作成](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-18)|
|12/19|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-19)|
|12/20|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-20)|
|12/21|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-21)|
|12/22|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-22)|
|12/23|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-23)|
|12/24|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-24)|
|12/25|[終わってみて？](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-25)|


