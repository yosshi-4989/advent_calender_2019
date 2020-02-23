# アドベントカレンダー全部俺2019…をやりたかった

去年、[先輩がアドベントカレンダーを一人でしていた](https://medium.com/escle/%E3%82%A2%E3%83%89%E3%83%99%E3%83%B3%E3%83%88%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC%E5%85%A8%E9%83%A8%E4%BF%BA2018%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81-2b85619096ff)。面白そうだったけど、去年はネタがなかったしやらなかった。今年は何となくやりたいなと思っていたけど、気づいたら初日が終わってた！

なんか悔しいけど、やってみたい欲はあるので1日遅れで初めます。

# 本日のコンテキスト[チャット]

再開3日目！<br>
アドベントカレンダー全部俺2019...をやりたかった、の22日目です。
<br>今日はチャット機能を作っていきます。とりあえずチャットだけ。

## 目次

1. [メッセージ送信機能](#メッセージ送信機能)
1. [メッセージ受信機能](#メッセージ受信機能)
1. [見た目の修正](#見た目の修正)
1. [おわりに](#おわりに)


## メッセージ受信機能

今回はまずは表示する機能から作成して見ます。
いつものようにFirestoreのコレクションからアイテムを取得する関数を実装します。
``

```diff
・・・
-import { first } from 'rxjs/operators';
+import { first, concatMap } from 'rxjs/operators';
・・・
+export interface IMessage {
+  uid: string;
+  card: string;
+  message: string;
+  timestamp: number;
+}

+export interface IChat extends IUser, IMessage { }
・・・
+  // チャットメッセージの取得
+  messageInit(roomId: string): Observable<IChat[]> {
+    return this.roomCollection.doc(roomId)
+      .collection<IMessage>('messages', ref => ref.orderBy('timestamp', 'asc'))
+      .valueChanges({idField: 'mid'}).pipe(
+        concatMap(async messages => {
+          const users = await this.af.collection<IUser>('users')
+            .valueChanges( {idField: 'uid'} ).pipe(first()).toPromise(Promise);
+          return messages.map(message => {
+            const user = users.find(u => u.uid === message.uid);
+            return Object.assign(message, user);
+          });
+        })
+      );
+  }
・・・
```

これをroomから呼び出します。

```diff
・・・
-import { FirestoreService, IRoomUser, IRoomInfo } from 'src/app/shared/firestore.service';
+import { FirestoreService, IRoomUser, IRoomInfo, IChat } from 'src/app/shared/firestore.service';
・・・
+  messages: Observable<IChat[]>;
・・・
   // ユーザ情報を取得
   async ionViewWillEnter() {
・・・
+    // チャット欄のメッセージ一覧
+    this.messages = this.firestore.messageInit(this.roomId);
・・・
+  trackByFnForMsg(index, msg) {
+    return msg.mid;
+  }
・・・
```

最後に画面に描画します。

```diff
・・・
     <!--  チャットエリア  -->
     <ion-menu menuId="chat" contentId="playarea" side="end" class="custom-menu">
       <ion-content>
+        <ion-list class="ion-padding-top">
+          <ion-item lines="none" *ngFor="let m of messages | async; trackBy: trackByFnForMsg">
+            </ion-avatar>
+            <ion-label class="ion-padding ion-text-wrap" style="background-color: var(--ion-color-light-tint); border-radius: 12px;"
+              [class.ion-margin-end]="m.uid !== uid" [class.ion-margin-start]="m.uid === uid">
+              <div class="ion-text-nowrap"><strong>{{m.displayName}}</strong>: <strong color="primary">{{m.card}}</strong></div>
+              {{m.message}}
+            </ion-label>
+          </ion-item>
+        </ion-list>
       </ion-content>
・・・
```

Firestoreに直接データを入力して動作確認すると以下のようになりました。

![チャット一覧](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-23/images/show-chat.png)

## メッセージ送信機能

メッセージ送信を作っていきます。

まずは送信するUIの作成です。
HTMLのテキストエリアを配置していた場所を変更して、メッセージを格納する変数と送信する関数を作成します。。

```diff
       <ion-footer>
-        <ion-textarea placeholder="Text Area"></ion-textarea>
+        <form #f=ngForm>
+          <ion-textarea class="ion-margin-start" autoGrow="true" rows="1" placeholder="メッセージ" [(ngModel)]="message" name="message" required></ion-textarea>
+          <ion-button fill="clear" size="small" (click)="postMessage()" [disabled]="!f.form.valid">送信</ion-button>
+        </form>
       </ion-footer>
     </ion-menu>
```

```diff
-import { Component, OnInit } from '@angular/core';
+import { Component, OnInit, ViewChild } from '@angular/core';
 import { ActivatedRoute, ParamMap } from '@angular/router';
 import { AuthService } from 'src/app/auth/auth.service';
-import { FirestoreService, IRoomUser, IRoomInfo } from 'src/app/shared/firestore.service';
-import { AlertController, NavController } from '@ionic/angular';
+import { FirestoreService, IRoomUser, IRoomInfo, IChat } from 'src/app/shared/firestore.service';
+import { AlertController, NavController, IonContent } from '@ionic/angular'; import { Observable } from 'rxjs';
 import { map, first } from 'rxjs/operators';
・・・
+  message: string;
+
+  @ViewChild(IonContent, { static: true})
+  content: IonContent;
・・・
+  // メッセージ送信
+  postMessage() {
+    if (!this.user) {
+      alert('ユーザー情報がありません。');
+      return;
+    }
+    this.firestore.messageAdd(this.roomId, {
+      uid: this.uid,
+      card: this.user.card,
+      message: this.message,
+      timestamp: Date.now(),
+    });
+    this.message = '';
+    this.content.scrollToBottom(100);
+  }
```

そしていつものようにメッセージのinterfaceを作成し、Firestoreにメッセージを追加します。

```diff
+  // チャットメッセージの追加
+  messageAdd(roomId: string, message: IMessage) {
+    return this.roomCollection.doc(roomId).collection<IMessage>('messages').add(message);
+  }
```

これでチャット機能終わりです！
見た目はこんな感じ！機能だけなので見た目は勘弁！

![チャット画面UI](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-23/images/send-msg.png)

## おわりに

やったー！とりあえず、機能面だけで言えば最低限のものができたと思います！

ここからはちょこちょこ機能を追加する感じのことをしていこうかなと思っています。

次は何かな。チャットにタイトル・非表示中はチャットのナンバーを非表示にする・表示中はカード変更不可・非ログイン中のユーザーのdisable化、などなどやりたいことはあるので、何かをまとめてみようと思います。

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
|12/22(02/23)|[カード提出機能](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-22)|
|12/23|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-23)|
|12/24|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-24)|
|12/25|[終わってみて？](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-25)|


