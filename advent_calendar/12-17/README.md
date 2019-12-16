# アドベントカレンダー全部俺2019…をやりたかった

去年、[先輩がアドベントカレンダーを一人でしていた](https://medium.com/escle/%E3%82%A2%E3%83%89%E3%83%99%E3%83%B3%E3%83%88%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC%E5%85%A8%E9%83%A8%E4%BF%BA2018%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81-2b85619096ff)。面白そうだったけど、去年はネタがなかったしやらなかった。今年は何となくやりたいなと思っていたけど、気づいたら初日が終わってた！

なんか悔しいけど、やってみたい欲はあるので1日遅れで初めます。

# 本日のコンテキスト[Split Paneでメニューを実装してみる！]

アドベントカレンダー全部俺2019...をやりたかった、の16日目です。
<br>昨日、プロフィール編集画面を作るといいましたが、登録できても編集する機能を忘れていたので、編集する機能を実装します。ついでにログアウト機能も仮実装から本実装に移していきます。

## 目次

1. [メニューバー with Split Pane](#メニューバー-with-Split-Pane)
1. [プロフィール編集モーダル](#プロフィール編集モーダル)
1. [ログアウト機能](#ログアウト機能)
1. [おわりに](#おわりに)

## メニューバー with Split Pane

プロフィール編集モーダルの表示とログアウト機能はメニューバーに追加して実装してみます。

まずは[Split Pane](#https://ionicframework.com/docs/api/split-pane)のサンプルを見てみます。

```html
<ion-split-pane contentId="menu-content">
  <!--  our side menu  -->
  <ion-menu contentId="menu-content">
    <ion-header>
      <ion-toolbar>
        <ion-title>Menu</ion-title>
      </ion-toolbar>
    </ion-header>
  </ion-menu>

  <!-- the main content -->
  <ion-router-outlet id="menu-content"></ion-router-outlet>
</ion-split-pane>
```

`<ion-router-outlet>`は`app.component.html`内に記載するAngularアプリのメインコンテンツを表示する領域なので、試しに、ここをリストのページそのままで表示してみます。

```html
<ion-split-pane contentId="menu-content">
  <!--  our side menu  -->
  <ion-menu contentId="menu-content">
    <ion-header>
      <ion-toolbar>
        <ion-title>Menu</ion-title>
      </ion-toolbar>
    </ion-header>
  </ion-menu>

  <!-- the main content -->
  <ion-content id="menu-content">
    <!-- この要素はlist.page.htmlのまま -->
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>list</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item (click)="signOut()" button=true>
          <ion-label>ログアウト</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-content>
</ion-split-pane>
```

こんな風になりました！

![メニュー1](https://github.com/yosshi-4989/advent_calender_2019/tree/master/advent_calendar/12-17/images/menu1.png)

これで行けそうですね。ただ、メニューの表示方法が個人的に好きではないので変更してみます。
<br>表示方法を変更する際には`<ion-menu>`にtypeプロパティを設定することで変更できるようです。typeには"overlay", "reveal", "push"の三種類あるようです。

![メニュー2](https://github.com/yosshi-4989/advent_calender_2019/tree/master/advent_calendar/12-17/images/menu2.png)

個人的には"overlay"か"push"が好きなので今回は"overlay"で実装してみます。

```html
  ・・・
  <!--  our side menu  -->
- <ion-menu contentId="menu-content">
+ <ion-menu type="overlay" contentId="menu-content">
    <ion-header>
    ・・・
```

これでメニューが表示できるようになりました！

## プロフィール編集モーダル

では、プロフィール編集モーダルを表示してみます。
<br>まずはメニューに編集ボタンを追加します！

```html
  <ion-menu contentId="menu-content">
    <ion-header>
      <ion-toolbar>
-       <ion-title>Menu</ion-title>
+       <ion-title>設定</ion-title>
      </ion-toolbar>
    </ion-header>
+   <ion-content>
+     <ion-list>
+      <ion-item button=true>
+         <ion-icon name="person" slot="start"></ion-icon>
+         <ion-label>プロフィール</ion-label>
+       </ion-item>
+     </ion-list>
+   </ion-content>
  </ion-menu>
```

そしてプロフィール編集モーダルを表示する処理を記載します。

```typescript
// src/app/poker/list/list.page.ts
    ・・・
+   // プロフィールモーダルを開く
+   async openProfile() {
+     const modal = await this.modalController.create({
+       component: ProfilePage,
+     });
+     modal.present();
+   }
  }
```

これを先ほど作成したボタン(？)を押すと呼び出されるようにします。

```html
      ・・・
-      <ion-item button=true>
+      <ion-item (click)="openProfile()" button=true>
          <ion-icon name="person" slot="start"></ion-icon>
          <ion-label>プロフィール</ion-label>
        </ion-item>
        ・・・
```

これでプロフィールの編集も可能になりました！

## ログアウト機能

最後にListページに仮実装しているログアウト機能もメニューに移動させてしまいましょう！

```html
        ・・・
+      <ion-item (click)="signOut()" button=true>
+         <ion-icon name="log-out" slot="start"></ion-icon>
+         <ion-label>ログアウト</ion-label>
+       </ion-item>
        ・・・
```

![メニュー](https://github.com/yosshi-4989/advent_calender_2019/tree/master/advent_calendar/12-17/images/menu3.png)

## おわりに

カメラの変更かルーム一覧画面を作るといったな…。すまん、ありゃ嘘だった。

カメラはトライアンドエラーになりそうなので時間に余裕があればやろうと思いますが、完成を優先しようと思います。
<br>また、プロフィール変更ができない状況であることに気づき、さすがに実装しないといけないと思ったので、先にこちらの対応をしました。
<br>ついでにプランニングポーカーのルーム画面で利用する予定の`split-pane`についての予習も兼ねた動作確認も目的としていました。
<br>割と簡単に実装できそうなのでよさそうかな？(笑)

さて、明日ことは一覧画面を作っていきます！
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
|12/16|[プロフィール編集画面の作成](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-16)|
|12/17|[Split Paneでメニューを実装してみる！](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-17)|
|12/18|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-18)|
|12/19|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-19)|
|12/20|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-20)|
|12/21|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-21)|
|12/22|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-22)|
|12/23|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-23)|
|12/24|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-24)|
|12/25|[終わってみて？](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-25)|


