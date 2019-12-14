# アドベントカレンダー全部俺2019…をやりたかった

去年、[先輩がアドベントカレンダーを一人でしていた](https://medium.com/escle/%E3%82%A2%E3%83%89%E3%83%99%E3%83%B3%E3%83%88%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC%E5%85%A8%E9%83%A8%E4%BF%BA2018%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81-2b85619096ff)。面白そうだったけど、去年はネタがなかったしやらなかった。今年は何となくやりたいなと思っていたけど、気づいたら初日が終わってた！

なんか悔しいけど、やってみたい欲はあるので1日遅れで初めます。

# 本日のコンテキスト[プロジェクトの作成]

アドベントカレンダー全部俺2019...をやりたかった、の13日目です。
<br>今日からプランニングポーカーを作っていきます。

## 目次

1. [今日やること](#今日やること)
1. [プロジェクトの作成](#プロジェクトの作成)
1. [タイトルロゴ](#タイトルロゴ)
1. [タイトル画面](#タイトル画面)
1. [タイトル画面のレイアウト調整](#タイトル画面のレイアウト調整)
1. [おわりに](#おわりに)

## 今日やること

今日はタイトル画面の作成をしていきます。

[やることリスト]
- プロジェクトの作成
- 新規リポジトリ作成(ここは省略)
- タイトル画面の実装

## プロジェクトの作成

昨日までのプロジェクトはアドベントカレンダーのリポジトリの中に作成していましたが、今回はちゃんと分けて管理していこうと思います。(なのでこのリポジトリのコミットは基本的にREADMEの更新のみになります。)

```
$ ionic start planning-poker blank --type=angular # Angularで空のプロジェクトを作成
$ cd planning-poker
$ npm install firebase @angular/fire # Firebaseと連携するためのパッケージインストール
```

これで準備OK！


## タイトルロゴ
タイトル画面は、タイトルロゴとログインボタン、登録ボタンだけが置いてあるシンプルな仕様にしたいと思います。

まずはタイトルロゴを作成します。今回は[Cool Text](https://ja.cooltext.com/)というサイトで作成しました。

気になるフォントをクリックして、ロゴの文字を入力して、「Create Logo」で完成です。

![作成したロゴ](https://github.com/yosshi-4989/planning-poker/tree/master/src/assets/title-logo.png)

よさそうじゃね？いまいちかな？よくわからん。とりあえずこれで行きます。

## タイトル画面の作成

では、画面を作っていきます。
<br>ヘッダはいらないので削除します。なんとなくポーカーで遊ぶマットが緑のイメージなので、背景は緑色系にします。適当に画像とボタンを配置します。

```html
<!-- colorで色の指定 -->
<ion-content color="success">
  <div class="ion-text-center">
    <div class="ion-text-center ion-padding">
      <!-- titleロゴの表示 -->
      <img [src]="'assets/title-logo.png'">
    </div>
    <!-- ボタンの配置 -->
    <div class="ion-text-center ion-padding-top">
      <ion-button shape="round">ログイン</ion-button>
    </div>
    <div class="ion-text-center ion-padding-top">
      <ion-button shape="round">ユーザー登録</ion-button>
    </div>
  </div>
</ion-content>
```

出来上がりはこんな感じです。

![タイトル画面1](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-13/images/title-view1.png)

うーん…、ダサい？なんか上によってるし。せめて真ん中によってればなぁ…。
<br>(ちなみに全画面のブラウザで見るともっとやばい)

## タイトル画面のレイアウト調整

いろいろ調べたけどうまく真ん中に配置できなかったのでpaddingを利用することにした。

まずタイトルの位置調整用のクラスを作成して、CSSを作ります。

```scss
// src/app/home/home.page.scss
.title-context {
  max-width: 400px; // 横幅の上限を決める
  margin: auto;     // 画面真ん中に配置する(横方向)
}
.title-position {
  // 横幅に対する割合で調整(親要素のwidthに依存する)
  padding-top: 40%; 
}
```

作成したクラスを対応するdivにつけます。

```html
  <ion-content color="success">
-   <div class="ion-text-center ion-padding">
-     <div class="ion-text-center">
+   <div class="ion-text-center ion-padding title-context">
+     <div class="ion-text-center title-position">
        <img [src]="'assets/title-logo.png'">
      </div>
      <div class="ion-text-center ion-padding-top">
        <ion-button shape="round">ログイン</ion-button>
      </div>
      <div class="ion-text-center ion-padding-top">
        <ion-button shape="round">ユーザー登録</ion-button>
      </div>
    </div>
  </ion-content>
```

こんな感じになりました。

![タイトル画面2](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-13/images/title-view2.png)

うん、まぁ、ましになったと思います。(フォントのせいかボタンが浮いてたりしてますが…)

## おわりに

まさかタイトル画面で一日が終わるとは思わなかった…。
<br>ちょっと想定外でしたが、ゆっくり進めていきます。
<br>正直レイアウト調整はこれで正しいのかわからないんですが、動きゃあいいんですよ。とりあえずは。
<br>という気持ちで進めていきます！

ということで明日は認証画面を作っていきます！
ルーティング周りの復習になるかなぁ…と思ってますね。

## おまけ

真ん中に配置しようと頑張っていた時のコードを備忘録代わりにおいておく。

```scss
.title-context {
  position: absolute;
  // 上下左右ともに50%ずらして
  top: 50%;
  left: 50%;
  // 要素の50%戻す
  transform: translateY(-50%) translateX(-50%);
  -webkit-transform: translateY(-50%) translateX(-50%);
}
```

これだと確かに真ん中に配置できるが、divの要素のサイズも小さくなっているのかタイトルロゴも小さくなってしまったので断念しました。
(topのみも試しましたが、左にくっつてしまうのでダメでした)

![タイトルロゴが小さい](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-13/images/title-view-omake.png)

以上おまけ終わり。

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


