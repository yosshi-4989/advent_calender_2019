# アドベントカレンダー全部俺2019…をやりたかった

去年、[先輩がアドベントカレンダーを一人でしていた](https://medium.com/escle/%E3%82%A2%E3%83%89%E3%83%99%E3%83%B3%E3%83%88%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC%E5%85%A8%E9%83%A8%E4%BF%BA2018%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81-2b85619096ff)。面白そうだったけど、去年はネタがなかったしやらなかった。今年は何となくやりたいなと思っていたけど、気づいたら初日が終わってた！

なんか悔しいけど、やってみたい欲はあるので1日遅れで初めます。

# 本日のコンテキスト[カード提出機能]

再開して2日目！<br>
アドベントカレンダー全部俺2019...をやりたかった、の21日目です。
<br>今日は提出カード情報をFirebaseに登録する処理を作成していきます。

## 目次

1. [入室ユーザー登録](#入室ユーザー登録)
1. [カード提出機能]](#カード提出機能)
1. [提出カード一覧表示](#提出カード一覧表示)
1. [他ユーザーの表示非表示](#他ユーザーの表示非表示)
1. [おわりに](#おわりに)

## 入室ユーザー登録

入室したユーザーの一覧を管理するために、ルームに入室したときにFirestoreに登録する処理を作成する。

Firebaseへの登録には共通モジュールの`FirestoreService`を利用していたので、まずユーザーの取得と登録する処理を作成する。
`src/app/shared/firestore.service.ts`

```diff
・・・
+// 入室メンバーのステータス
+export interface IRoomUser {
+  id: string;
+  name: string;
+  card: string;
+  enterDate: Date;
+}
・・・
+  // ユーザー情報の取得
+  roomUserInit(roomId: string, uid: string): Promise<IRoomUser> {
+    return this.roomCollection.doc<IRoomUser>(roomId + '/users/' + uid)     
+      .valueChanges()
+      .pipe(first())
+      .toPromise(Promise);
+  }
+  // 入室ユーザー情報の登録
+  roomUserSet(roomId: string, user: IRoomUser): Promise<void> {
+    return this.roomCollection.doc<IRoomUser>(roomId + '/users/' + user.id).set(user);
+  }
・・・
```

作成できたので、これを使って登録する処理を作成しましょう。
`src/app/poker/room/room.page.ts`

```diff
・・・
-import { FirestoreService, IUser } from 'src/app/shared/firestore.service';
+import { FirestoreService, IRoomUser } from 'src/app/shared/firestore.service';
・・・
-  user: IUser;
+  user: IRoomUser;
・・・
   // ユーザ情報を取得
   async ionViewWillEnter() {
     this.uid = this.auth.getUserId();
-    this.user = await this.firestore.userInit(this.uid);
+    // ユーザーを取得(すでに存在する場合に取得できる)
+    this.user = await this.firestore.roomUserInit(this.roomId, this.uid);   
+    // ユーザーが存在しない場合は登録する
+    if (!this.user) {
+      const user = await this.firestore.userInit( this.auth.getUserId() );  
+      this.user = {
+        id: this.uid,
+        name: user.displayName,
+        card: null,
+        enterDate: new Date(), // 入室日時を格納
+      };
+      this.firestore.roomUserSet(this.roomId, this.user);
+    }
・・・
```

これで実際に「検証用1」ルームに入って見ると以下のようになりました。
よさそうですね。

![ユーザー情報の登録](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-22/images/user-set.png)

## カード提出機能

無事入室できるようになったので、カードを提出できるようにしていきます。
先ほど、ユーザ情報を更新する処理を作成しており、ユーザー情報内にカード情報があるので、roomのほうで関数を作り、クリックイベントで呼び出せば完了です。
`src/app/poker/room/room.page.ts`

```diff
+   // カード情報を更新
+  async updateCard(num: string) {
+    this.user.card = num;
+    this.firestore.roomUserSet(this.roomId, this.user);
+  }
```

`src/app/poker/room/room.page.html`
```diff
-          <app-poker-card class="hand-card" userName="uname" number="{{num}}" userColor="primary" [isOpen]="true"  *ngFor="let num of ['0', '1/2', '1', '2', '3', '5', '8', '13', '20', '40', '100', '∞', '?']"></app-poker-card>     
+          <app-poker-card class="hand-card" [number]="num" userColor="primary" [isOpen]="true"
+            *ngFor="let num of ['0', '1/2', '1', '2', '3', '5', '8', '13', '20', '40', '100', '∞', '?', null]" (click)="updateCard(num)">
+          </app-poker-card>
```

ほい、これで選択したカードの情報を管理できるようになりました。
クリックすると以下のように`card`が選択した数値(の文字列)になります。

![カード情報の更新](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-22/images/update-card.png)

## 提出カード一覧表示

カード選択できるようになったので、選択したカードを表示できるようにしましょう。

まずはおなじみFirestoreからユーザーリストを持ってきます。
`src/app/poker/room/room.page.ts`

```diff
・・・
+  // ルームにいるユーザー一覧の取得(変更をリアルタイムに受けるためObservable)
+  roomUserListInit(roomId: string): Observable<IRoomUser[]> {
+    return this.roomCollection.doc(roomId)
+      .collection<IRoomUser>('users', ref => ref.orderBy('enterDate', 'desc'))
+      .valueChanges();
+  }
・・・
```

それをroom側で保持します。
`src/app/poker/room/room.page.ts`

```diff
・・・
+import { Observable } from 'rxjs';
・・・
+  users: Observable<IRoomUser[]>;
・・・
  // ユーザ情報を取得
  async ionViewWillEnter() {
・・・
+    // ルームのユーザーリストの取得
+    this.users = this.firestore.roomUserListInit(this.roomId);
・・・
```

そして画面側から参照します。
`src/app/poker/room/room.page.html`
```diff
           <ion-row>
-            <ion-col *ngFor="let i of [1,1,1,1,1,1,1,1,1]" size-lg="2" size-md="3" size-sm="2" size="3">
-              <app-poker-card userName="uname" number="1" userColor="primary" [isOpen]="false"></app-poker-card>
+            <ion-col *ngFor="let u of users | async; trackBy: trackByFn" size-lg="2" size-md="3" size-sm="2" size="3">
+              <app-poker-card [number]="u.card" userColor="primary" [isOpen]="u.id === user.id"></app-poker-card>
               <!-- ユーザー名 -->
-              <div color="primary" class="ion-text-center text-ellipse">uname</div>
+              <div color="primary" class="ion-text-center text-ellipse">{{u.name}}</div>
             </ion-col>
           </ion-row>
```
※このままだとカードの背景色がplaymatと同色になるので、`this.frontStyle`に`backgroundColor: 'white'`を追加しています。

これでカードが表示されるようになりました。

![カード情報の表示](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-22/images/show-card.png)

## 他ユーザーの表示非表示

最後にカードの表示非表示を切り替える機能を実装します。

まず、Room情報に表示非表示状態を持たせてRoom情報を保持するようにします。また、表示非表示の切り替えの処理も持たせておく。
`src/app/shared/firestore.service.ts`
```diff
・・・
 export interface IRoomInfo {
   roomName: string;
   createDate: number;
+  cardOpen: boolean;
 }
・・・
+  // ルーム情報を取得
+  roomInfoInit(roomId: string): Observable<IRoomInfo> {
+    return this.roomCollection.doc<IRoomInfo>(roomId).valueChanges();       
+  }
+  // ルーム情報を更新する
+  roomInfoSet(roomId: string, roomInfo: IRoomInfo) {
+    this.roomCollection.doc<IRoomInfo>(roomId).set(roomInfo);
+  }
・・・
```

`src/app/poker/room/room.page.ts`
```diff
・・・
-import { FirestoreService, IRoomUser } from 'src/app/shared/firestore.service';
+import { FirestoreService, IRoomUser, IRoomInfo } from 'src/app/shared/firestore.service';
 import { AlertController, NavController } from '@ionic/angular';
 import { Observable } from 'rxjs';
+import { map, first } from 'rxjs/operators';
・・・
+  roomInfo: IRoomInfo;
+  cardOpen: Observable<boolean>;
・・・
+  // 表示カードを開く
+  async openCard() {
+    this.roomInfo.cardOpen = true;
+    this.firestore.roomInfoSet(this.roomId, this.roomInfo);
+  }
+  // 表示カードを伏せる
+  async closeCard() {
+    this.roomInfo.cardOpen = false;
+    this.firestore.roomInfoSet(this.roomId, this.roomInfo);
+  }
・・・
   // ユーザ情報を取得
   async ionViewWillEnter() {
・・・
+    // ルーム情報を取得
+    const info = this.firestore.roomInfoInit(this.roomId)
+    // カードの表示情報のバインディングのためにObservableで取得
+    this.cardOpen = info.pipe( map(inf => inf.cardOpen) );
+    // こちらは更新用に固定値でよいのでIRoomInfoオブジェクトを取得
+    this.roomInfo = await info.pipe(first()).toPromise(Promise);・・・
```

この時、roomInfoの情報を取得するのにとても手間取りました。
`.pipe(first())`を付けていなかったことが原因でした。
おそらく`.valueChanges()`関数の中では、対象が一つでもリストなどのコレクションとして所持しており、`.first()`で1つだけ取得しないといけなかったんだろうなと思っています。

次に、画面側で反映できるように修正します。また、切り替えのボタンを表示します。

`src/app/poker/room/room.page.html`
```diff
-              <app-poker-card [number]="u.card" userColor="primary" [isOpen]="u.id === user.id"></app-poker-card>
+              <app-poker-card [number]="u.card" userColor="primary" [isOpen]="(cardOpen | async) || u.id === user.id"></app-poker-card>
・・・
+        <ion-button (click)="openCard()">Open</ion-button>
+        <ion-button (click)="closeCard()">Close</ion-button>
```

本当にボタンは置いただけです。これでこのような見た目になるはず！

![他ユーザーのカード表示](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-22/images/other-user.png)

## おわりに

ボタン配置がすげー適当ですが、何とかプランニングポーカーはできるようにな...ったと思います！あとはチャット機能の実装ができれば今回の目標達成となります！もう少し！

次回はチャット機能の実装を進めていきます！

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
|12/19|[カスタムコンポーネントでトランプのテンプレートを作成する](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-19)|
|12/20|[プレイルームのレイアウト](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-20)|
|12/21(02/22)|[カードプレイエリア](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-21)|
|12/22|[カード提出機能](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-22)|
|12/23|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-23)|
|12/24|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-24)|
|12/25|[終わってみて？](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-25)|


