# アドベントカレンダー全部俺2019…をやりたかった

去年、[先輩がアドベントカレンダーを一人でしていた](https://medium.com/escle/%E3%82%A2%E3%83%89%E3%83%99%E3%83%B3%E3%83%88%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC%E5%85%A8%E9%83%A8%E4%BF%BA2018%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81-2b85619096ff)。面白そうだったけど、去年はネタがなかったしやらなかった。今年は何となくやりたいなと思っていたけど、気づいたら初日が終わってた！

なんか悔しいけど、やってみたい欲はあるので1日遅れで初めます。

# 本日のコンテキスト[カスタムコンポーネントでトランプのテンプレートを作成する]

アドベントカレンダー全部俺2019...をやりたかった、の18日目です。
<br>今日はプランニングポーカーのカードのモジュールを作成していきます。

## 目次

1. [はじめに(機能の実装漏れ)](#はじめに(機能の実装漏れ))
1. [カスタムコンポーネントの作成](#カスタムコンポーネントの作成)
1. [ポーカーのカードを作成](#ポーカーのカードを作成)
1. [おわりに](#おわりに)

## はじめに(機能の実装漏れ)

本題に入る前に昨日の作業内容に漏れがあり、バグになってしまっている個所を発見しましたので訂正をしておきます。(管理の仕方が悪いから過去記事の追記がめんどい)

ルーム一覧画面へのルーティングを修正する際に、ログイン成功後のリダイレクト先の修正が漏れていたため、ログインした際にRoomページに遷移していました。
<br>以下のように修正すれば想定通りの動作になります。

```typescript
// src/app/auth/auth.service.ts
    // 登録して一覧ページへ遷移
    authSignUp(login: { email: string, password: string}) {
      return this.afAuth.auth
        .createUserWithEmailAndPassword(login.email, login.password)
-       .then(() => this.navController.navigateForward('poker/list'))
+       .then(() => this.navController.navigateForward('poker'))
        .catch(error => {
          this.alertError(error);
          throw error;
        });
    }
    // ログインして一覧ページへ遷移
    authSignIn(login: { email: string, password: string}) {
      return this.afAuth.auth
        .signInWithEmailAndPassword(login.email, login.password)
-       .then(() => this.navController.navigateForward('poker/list'))
+       .then(() => this.navController.navigateForward('poker'))
        .catch(error => {
          this.alertError(error);
          throw error;
        });
    }
```

以上訂正でした。

## カスタムコンポーネントの作成

それではポーカーのカードを作っていきます！

まずはコンポーネントを生成します。

```
$ ionic g component shared/poker-card
```

このコンポーネントをSharedモジュールに登録します。

```typescript
// src/app/shared/shared.module.ts
  ・・・
+ import { PokerCardComponent } from './poker-card/poker-card.component';

  @NgModule({
-   declarations: [ProfilePage],
+   declarations: [ProfilePage, PokerCardComponent],
+   exports: [PokerCardComponent],
    ・・・
```

これでsharedモジュールを経由してコンポーネントにアクセスできるようになりました。

## ポーカーのカードを作成

それでは作成したコンポーネントにカードを格納していきます。

まずカードを描画する際に必要なデータを受け取るようにします。

```typescript
// src/app/shared/poker-card/poker-card.component.ts
- import { Component, OnInit } from '@angular/core';
+ import { Component, OnInit, Input } from '@angular/core';
  ・・・
  export class PokerCardComponent implements OnInit {
+   @Input() userName: string;
+   @Input() number: string; // 数字以外も入るため文字列型
+   @Input() userColor: string; // カード色
+   @Input() isOpen: boolean;
    ・・・
```

まず、カード状の物を作ります。

```scss
.p-card {
  border: solid 1px #4e4e4e;
  border-radius: 10px;
  width: 70px;
  height: 100px;
  float: left;
  margin: 5px;
}

.middle-center {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  line-height: 100px;
}
```

```html
<ion-card class="p-card ion-text-center">
  <ion-card-title class="middle-center">{{number}}</ion-card-title>
</ion-card>
<ion-card class="p-card ion-text-center">
  <ion-icon class="middle-center" name="moon" size="large"></ion-icon>
</ion-card>
```

roomページに以下の行を追加して見た目を確認します。

```html
  <app-poker-card userName="uname" number="1" userColor="primary" [isOpen]="true"></app-poker-card>
```

![最初](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-19/images/card1.png)

次に色を付けていきます。このとき、裏面は`color`を利用します。表面は`ngStyle`でTypescriptで定義したハッシュをstyleとして定義できるので、これを利用します。

```typescript
  export class PokerCardComponent implements OnInit {
    @Input() userName: string;
    @Input() number: string; // 数字以外も入るため文字列型
    @Input() userColor: string; // カード色
    @Input() isOpen: boolean;
+   frontStyle;

    constructor() { }

    ngOnInit() {
+     // userColorのテーマの値を取得する
+    this.frontStyle = {color: 'var(--ion-color-' + this.userColor + ')'};
    }
  }
```

```html
  <ion-card class="p-card ion-text-center">
-   <ion-card-title class="middle-center">{{number}}</ion-card-title>
+   <ion-card-title class="middle-center" [(ngStyle)]="frontStyle">{{number}}</ion-card-title>
  </ion-card>
- <ion-card class="p-card ion-text-center">
+ <ion-card class="p-card ion-text-center" [color]="userColor">
    <ion-icon class="middle-center" name="moon" size="large"></ion-icon>
  </ion-card>
```

![色付けた](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-19/images/card1.png)

最後に、`isOpen`で表示非表示を切り替えます。

```html
- <ion-card class="p-card ion-text-center">
+ <ion-card class="p-card ion-text-center" *ngIf="isOpen">
    <ion-card-title class="middle-center" [(ngStyle)]="frontStyle">{{number}}</ion-card-title>
  </ion-card>
- <ion-card class="p-card ion-text-center" [color]="userColor">
+ <ion-card class="p-card ion-text-center" [color]="userColor" *ngIf="!isOpen">
    <ion-icon class="middle-center" name="moon" size="large"></ion-icon>
  </ion-card>
```

roomの`isOpen`の値を変更して表裏が切り替わっていることを確認できればOKです。

## おわりに

これでカードコンポーネントができたので、実装するときは一行呼び込むだけでOKになりました！やったぜ！

軽めにやろうと思ったら結構かかったパート2！ちょっといろいろやりたいことも残ってるけど、いったんここまでにします。後々ユーザー名は不要にするかも。

やりたかったことリスト
- isOpenの変化をトリガーにめくる機能
- 名前を表示する
- サイズ固定ではなく、ある程度ウィンドウサイズに依存したサイズになる

後々はユーザー情報に色を選択させて、ユーザーの好きに色を選べるようになったらいいなぁ、とか考えてます。

以上！明日は、ポーカーのページを作っていきたいな！2日に分けるかも！<br>それではまた明日！

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
|12/20|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-20)|
|12/21|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-21)|
|12/22|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-22)|
|12/23|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-23)|
|12/24|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-24)|
|12/25|[終わってみて？](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-25)|


