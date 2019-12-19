# アドベントカレンダー全部俺2019…をやりたかった

去年、[先輩がアドベントカレンダーを一人でしていた](https://medium.com/escle/%E3%82%A2%E3%83%89%E3%83%99%E3%83%B3%E3%83%88%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC%E5%85%A8%E9%83%A8%E4%BF%BA2018%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81-2b85619096ff)。面白そうだったけど、去年はネタがなかったしやらなかった。今年は何となくやりたいなと思っていたけど、気づいたら初日が終わってた！

なんか悔しいけど、やってみたい欲はあるので1日遅れで初めます。

# 本日のコンテキスト[プレイルームのレイアウト]

アドベントカレンダー全部俺2019...をやりたかった、の19日目です。
<br>今日はプレイルームのレイアウトを構築していきます。

## 目次

1. [プレイルームの構成](#プレイルームの構成)
1. [おわりに](#おわりに)

## プレイルームの構成

余裕があれば解説いれる

```scss
.split-pane-visible > .split-pane-side {
  max-width: 50%;
}
.custom-menu {
  --width: 80%;
}
.playarea {
  padding-top: 40px;
}
```

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
  <ion-split-pane when="md">
    <!--  チャットエリア  -->
    <ion-menu side="end" class="custom-menu">
      <ion-content>
      </ion-content>

      <ion-footer>
        <ion-textarea placeholder="Text Area"></ion-textarea>
      </ion-footer>
    </ion-menu>

    <!--  プレイエリア  -->
    <div class="ion-page" main>
      <ion-content color="playmat" class="ion-padding-top">
        <app-poker-card userName="uname" number="1" userColor="primary" [isOpen]="false"></app-poker-card>
        <ion-fab horizontal="end" vertical="bottom" slot="fixed">
          <ion-menu-toggle>
            <ion-fab-button color="primary">
              <ion-icon name="chatboxes"></ion-icon>
            </ion-fab-button>
          </ion-menu-toggle>
        </ion-fab>
      </ion-content>

      <ion-footer>
        <app-poker-card userName="uname" number="1" userColor="primary" [isOpen]="false"></app-poker-card>
      </ion-footer>
    </div>
  </ion-split-pane>
</ion-content>
```

![ウィンドウ](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-20/images/playroom.png)
![スマホ](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-20/images/playroom-phone.png)
![チャット広げる](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-20/images/playroom-phone-open-chat.png)

## おわりに

つかれた

明日はたぶんプレイエリアのコンテンツ

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
|12/21|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-21)|
|12/22|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-22)|
|12/23|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-23)|
|12/24|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-24)|
|12/25|[終わってみて？](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-25)|


