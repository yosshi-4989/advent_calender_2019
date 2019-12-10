# アドベントカレンダー全部俺2019…をやりたかった

去年、[先輩がアドベントカレンダーを一人でしていた](https://medium.com/escle/%E3%82%A2%E3%83%89%E3%83%99%E3%83%B3%E3%83%88%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC%E5%85%A8%E9%83%A8%E4%BF%BA2018%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81-2b85619096ff)。面白そうだったけど、去年はネタがなかったしやらなかった。今年は何となくやりたいなと思っていたけど、気づいたら初日が終わってた！

なんか悔しいけど、やってみたい欲はあるので1日遅れで初めます。

# 本日のコンテキスト[Firebaseを使ってチャットアプリ➃~ チャットの実装 ~]


## 目次

1. [メイン画面の調節](#メイン画面の調節)
1. [プロフィール登録画面の表示タイミングの変更](#プロフィール登録画面の表示タイミングの変更)
1. [チャット画面のモックアップ](#チャット画面のモックアップ)
1. [チャット機能の実装](#チャット機能の実装)
1. [おわりに](#おわりに)

## メイン画面の調節

チャット機能に入る前に、メインの画面の調整をします。

まず、Ionicでタブのプロジェクトを作成するとタブが3つついてきますが、今回は2つのみ使用するのでtab3に関するものはすべて削除します。
具体的にはtab3のディレクトリと`src/app/tab/tab-routing.module.ts`と`src/app/tabs/tabs.page.html`内のtab3にかかわる個所を削除します。

削除できたらタブの表示を変えましょう。

```html
// src/app/tabs/tabs.page.html
・・・
  <ion-tab-bar slot="bottom">
    <ion-tab-button tab="tab1">
      <ion-icon name="chatboxes"></ion-icon>
      <ion-label>チャット</ion-label>
    </ion-tab-button>

    <ion-tab-button tab="tab2">
      <ion-icon name="settings"></ion-icon>
      <ion-label>設定</ion-label>
    </ion-tab-button>
  </ion-tab-bar>
・・・
```

こんな感じになればOKです。

![タブ](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-11/images/tab-view.png)

## プロフィール登録画面の表示タイミングの変更

昨日作成したプロフィール登録画面はログイン直後、tab1に遷移したときに毎回表示されてうっとおしいので、登録されていないときのみ表示し、そうでないときはtab1を表示するようにしていきます。
<br>具体的な方法は、tab1を表示したときにFirestoreにユーザーが存在するか確認し、存在しないときに表示するように変更する。

```typescript
  ・・・
+ import { AuthService } from '../auth/auth.service';
+ import { FirestoreService } from '../shared/firestore.service';
  ・・・
  export class Tab1Page implements OnInit {

    constructor(
      public modalController: ModalController,
+     public auth: AuthService,
+     public firestore: FirestoreService,
    ) {}

    async ngOnInit() {
+     // authからuidを取得し、firestoreのデータを確認
+     const user = await this.firestore.userInit( this.auth.getUserId() );
+     if (!user) {
        // modalを作成
        const modal = await this.modalController.create({
          component: ProfilePage,
        });
        // modalを表示
        await modal.present();
+     }
    }
・・・
```

これで登録済みのユーザーでログインしたときにプロフィール登録画面が表示されなくなりました。ただ、このままだとプロフィールの変更ができないの設定タブ(tab2)からプロフィール登録画面を表示できるようにしましょう。

まずmoduleにSharedModuleを登録し。pageにプロフィールを開くボタンを追加します。

```typescript
// src/app/tab2/tab2.module.ts
  ・・・
+ import { SharedModule } from '../shared/shared.module';

  @NgModule({
    imports: [
      IonicModule,
      CommonModule,
      FormsModule,
+     SharedModule,
      ・・・
```

```typescript
// src/app/tab2/tab2.page.ts
  ・・・
+ import { ModalController } from '@ionic/angular';
+ import { ProfilePage } from '../shared/profile/profile.page';
  ・・・
    constructor(
      public auth: AuthService,
+     public modalController: ModalController,
    ) {}

+   async openProfile() {
+     const modal = await this.modalController.create({
+       component: ProfilePage,
+     });
+     modal.present();
+   }
  ・・・
```

```html
<!-- src/app/tab2/tab2.page.html -->
  <ion-header>
    <ion-toolbar>
      <ion-title>
-       Tab Two
+       設定
      </ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-list>
+     <ion-item (click)="openProfile()" button=true>
+       <ion-label>プロフィール</ion-label>
+     </ion-item>
      <ion-item (click)="signOut()" button=true>
        <ion-label>ログアウト</ion-label>
      </ion-item>
    </ion-list>
  </ion-content>
```

はい、これでプロフィールの編集も行えるようになりました。

## チャット画面のモックアップ

チャット画面のモックアップを作成していく準備ができましたので、さっそく取り掛かっていきましょう。
<br>といっても入力メッセージを格納する変数を`tab1.page.ts`に定義して、あとは見た目をそれっぽくするだけなのでガっと貼り付けます。

```typescript
// src/app/tab1/tab1.page.ts
  ・・・
  export class Tab1Page implements OnInit {
+   message = '';
    constructor(
  ・・・
```

```html
<!-- src/app/tab1/tab1.page.html -->
<ion-header>
  <ion-toolbar>
    <ion-title>
      チャット
    </ion-title>
    <ion-buttons slot="end">
      <ion-button fill="clear" size="small">送信</ion-button>
    </ion-buttons>
  </ion-toolbar>
  <ion-toolbar color="primary" style="padding: 4px 8px;">
    <ion-avatar slot="start" style="width: 36px; height: 36px;">
      <ion-img src="/assets/shapes.svg"></ion-img>
    </ion-avatar>
    <form #f=ngForm>
      <ion-textarea class="ion-margin-start" autoGrow="true" rows="1" placeholder="メッセージ" [(ngModel)]="message" name="message" required></ion-textarea>
    </form>
  </ion-toolbar>
</ion-header>

<ion-content>
  <ion-list class="ion-padding-top">
    <ion-item lines="none" *ngFor="let m of [1, 2, 3, 4, 5]">
      <ion-avatar slot="start">
        <ion-img src="/assets/shapes.svg" *ngIf="m != 3"></ion-img>
      </ion-avatar>
      <ion-label class="ion-padding ion-text-wrap" style="background-color: var(--ion-color-light-tint); border-radius: 12px;"
        [class.ion-margin-end]="m != 3" [class.ion-margin-start]="m === 3">
        <div class="ion-text-nowrap"><strong>表示名</strong></div>
        メッセージ
      </ion-label>
    </ion-item>
  </ion-list>
</ion-content>
```

こんな感じのモックアップができました！

![チャットモックアップ](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-11/images/chat-mockup.png)

## チャット機能の実装

さてメインです。まず、Firestoreにチャットの内容を格納/取得する処理を実装します。

```typescript
import { Injectable } from '@angular/core';
import { AngularFirestoreDocument, AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { first, concatMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface IUser {
  displayName: string;
  photoDataUrl: string;
}

// メッセージ情報を格納する型
export interface IMessage {
  uid: string;
  message: string;
  timestamp: number;
}
// ユーザー、メッセージの両方の要素を持つクラス型
export interface IChat extends IUser, IMessage {}

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  userDoc: AngularFirestoreDocument<IUser>;
  messageCollection: AngularFirestoreCollection<IMessage>;
  userCollection: AngularFirestoreCollection<IUser>;

  constructor(public af: AngularFirestore) {
    // メッセージのコレクションを時刻順に取得
    this.messageCollection = this.af.collection<IMessage>('chat', ref => ref.orderBy('timestamp', 'desc'));
    // ユーザのコレクションを取得
    this.userCollection = this.af.collection<IUser>('users');
  }

  // メッセージのコレクションにメッセージを追加
  messageAdd(message: IMessage) {
    return this.messageCollection.add(message);
  }

  // メッセージのコレクションから表示するIChat[]を生成する
  // PromiseではなくRxJSのObservable型で利用していることでメッセージのコレクションが更新されるとデータ取得が走る(ストリームが流れる、というらしい)
  chatInit(): Observable<IChat[]> {
    // メッセージコレクションのvalueを取得(DocumentのidをmessageIdとして追加)
    return this.messageCollection.valueChanges( {idField: 'messageId'} )
      // コレクションのメッセージ順に処理する
      .pipe(concatMap(async messages => {
        // ユーザーコレクションのvalueを取得(Documentのidをuidとして追加)
        const users = await this.userCollection.valueChanges( {idField: 'uid'} )
          .pipe(first()).toPromise(Promise);
        // IMessage[]からIChat[]を生成して返却
        return messages.map(message => {
          // messageのuidと一致するuserを取得
          const user = users.find(u => u.uid === message.uid);
          // message(IMessage型)にuser(IUser型)の要素を追加してIChat型のオブジェクトを生成
          return Object.assign(message, user);
        });
      }));
  }
・・・
```

これでチャットの一覧の取得と追加ができるようになった。できるようになったので、早速チャットページに入れましょう。

```typescript
- import { Component, OnInit } from '@angular/core';
- import { ModalController } from '@ionic/angular';
+ import { Component, OnInit, ViewChild } from '@angular/core';
+ import { ModalController, IonContent } from '@ionic/angular';
  import { ProfilePage } from '../shared/profile/profile.page';
  import { AuthService } from '../auth/auth.service';
- import { FirestoreService } from '../shared/firestore.service';
+ import { FirestoreService, IUser, IChat } from '../shared/firestore.service';
+ import { Observable } from 'rxjs';
・・・
  export class Tab1Page implements OnInit {
    message = '';
+   uid: string;
+   user: IUser;
+   chat: Observable<IChat[]>;

+   // contentプロパティを<ion-content>に紐づける
+   @ViewChild(IonContent, { static: true})
+   content: IonContent;
・・・
    async ngOnInit() {
      // authからuidを取得し、firestoreのデータを確認
      const user = await this.firestore.userInit( this.auth.getUserId() );
      if (!user) {
        ・・・
        await modal.present();
        // モーダルが非表示になった時にも表示するメソッドを実行してユーザー情報を取得する
+       modal.onWillDismiss().then(() => this.ionViewWillEnter());
      }
+     // chatを初期化
+     this.chat = this.firestore.chatInit();
    }

+   // ユーザ情報を取得
+   async ionViewWillEnter() {
+     this.uid = this.auth.getUserId();
+     this.user = await this.firestore.userInit(this.uid);
+   }

+   // メッセージの送信
+   postMessage() {
+     // ユーザー情報がない場合ははじく
+     if (!this.user) {
+       alert('プロフィール登録が必要です');
+       return;
+     }
+     // メッセージの送信
+     this.firestore.messageAdd({
+       uid: this.uid,
+       message: this.message,
+       timestamp: Date.now(),
+     });
+     // 入力の初期化
+     this.message = '';
+     // 100msかけて一番上までスクロールする
+     this.content.scrollToTop(100);
+   }

+   // チャットが更新されたときに全部再描画されないようにmessageIdで区別する
+   trackByFn(index, item) {
+     return item.messageId;
+   }
```

よっしゃいろいろ持ってきたけど、基本的には描画時にデータ持ってくるのとメッセージの送信処理の追加処理のみです。さあ、処理ができたので画面側から呼び出してみましょう。

```html
<ion-header>
  <ion-toolbar>
    <ion-title>
      チャット
    </ion-title>
    <ion-buttons slot="end">
      <ion-button fill="clear" size="small" (click)="postMessage()" [disabled]="!f.form.valid">送信</ion-button>
    </ion-buttons>
  </ion-toolbar>
  <ion-toolbar color="primary" style="padding: 4px 8px;">
    <ion-avatar slot="start" style="width: 36px; height: 36px;">
      <ion-img [src]="user?.photoDataUrl || '/assets/shapes.svg'"></ion-img>
    </ion-avatar>
    <form #f=ngForm>
      <ion-textarea class="ion-margin-start" autoGrow="true" rows="1" placeholder="メッセージ" [(ngModel)]="message" name="message" required></ion-textarea>
    </form>
  </ion-toolbar>
</ion-header>

<ion-content>
  <ion-list class="ion-padding-top">
    <ion-item lines="none" *ngFor="let c of chat | async; trackBy: trackByFn">
      <ion-avatar slot="start">
        <ion-img [src]="c.photoDataUrl" *ngIf="c.uid !== uid"></ion-img>
      </ion-avatar>
      <ion-label class="ion-padding ion-text-wrap" style="background-color: var(--ion-color-light-tint); border-radius: 12px;"
        [class.ion-margin-end]="c.uid !== uid" [class.ion-margin-start]="c.uid === uid">
        <div class="ion-text-nowrap"><strong>{{c.displayName}}</strong></div>
        {{c.message}}
      </ion-label>
    </ion-item>
  </ion-list>
</ion-content>
```

ほい、これでチャット機能も実装完了です！起動して動作確認してみましょう！

![チャットモックアップ](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-11/images/chat-capture.png)

いい感じですね！

## おわりに

チャットアプリの作成が終わりました！いろいろわからないところをすっ飛ばしてしまったので勉強しなきゃな、という気持ちもありますが、とりあえず完成したのでうれしいです。割とプランニングポーカーはこれをベースに作成できると思っているので、いろいろ考えてみようかなと思ってます。

明日はNetlifyとGithubを利用した自動デプロイをまとめる予定です。ここまでやれば今やってる本は終わって実際にプランニングポーカーの作成に移ろうかなと思います！

ではまた明日お会いしましょう！

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


