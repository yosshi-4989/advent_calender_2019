# アドベントカレンダー全部俺2019…をやりたかった

去年、[先輩がアドベントカレンダーを一人でしていた](https://medium.com/escle/%E3%82%A2%E3%83%89%E3%83%99%E3%83%B3%E3%83%88%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC%E5%85%A8%E9%83%A8%E4%BF%BA2018%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81-2b85619096ff)。面白そうだったけど、去年はネタがなかったしやらなかった。今年は何となくやりたいなと思っていたけど、気づいたら初日が終わってた！

なんか悔しいけど、やってみたい欲はあるので1日遅れで初めます。

# 本日のコンテキスト[カードプレイエリア]

一時中断していたけど再開します！<br>
アドベントカレンダー全部俺2019...をやりたかった、の20日目です。
<br>今日はカードプレイエリアの作成をしていきます。

## 目次

1. [カード配置(グリッドレイアウト)](#グリッドレイアウト)
1. [ユーザー情報を載せる](#ユーザー情報を載せる)
1. [手札配置](#手札配置)
1. [おわりに](#おわりに)

## グリッドレイアウト

ユーザーが選択したカードをプレイエリアに表示する機能を作っていきます。

プレイエリア周辺に(テーブルを囲うように)ユーザーの表示エリアがあったほうがかっこいい気がしますが、今回は勉強(と手間)を考慮してグリッドレイアウトでただカードを並べるだけの機能を作ってみます。

ということで、[Ionicのドキュメント](https://ionicframework.com/jp/docs/layout/grid)を参考に作っていきます。

`src\app\poker\room\room.page.html`を以下のように編集する。

```diff
-        <app-poker-card userName="uname" number="1" userColor="primary" [isOpen]="false"></app-poker-card>
+        <!-- カード表示エリア -->
+        <ion-grid>
+          <ion-row>
+            <ion-col *ngFor="let i of [1,1,1,1,1,1,1,1,1]"  size-lg="2" size-md="3" size-sm="2" size="3">
+              <app-poker-card userName="uname" number="1" userColor="primary" [isOpen]="false"></app-poker-card>
+            </ion-col>
+          </ion-row>
+        </ion-grid>
```

するとこんな感じになります。

![グリッド表示](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-21/images/grid.png)

`[1,1,1,1,1,1,1,1,1]`は9枚のカードを表示するために適用に書いているだけなので気にしないでください。

メインは`size-lg="2" size-md="3" size-sm="2" size="3"`です。
`size`はBootstrapの`col`に相当する、といえば伝わるでしょうか？
表示領域を12分割したうちのいくつ領域を使用するかを設定することができます。
`-xx`はそれぞれのウィンドウ(表示領域ではなく)サイズに応じてsizeを指定することができるようになります。これによって、ウィンドウの幅に応じてカードの表示枚数を変更することができます。

今回だと、基本は1行4枚表示していて、576px(-sm)以上になると6枚、768px(-md)以上だとチャットエリアが常時表示されるので4枚に戻して、992px(-lg)以上ではまた広くなるので6枚表示に変える、という設定になっています。

## ユーザー情報を載せる

これでカードを並べることができましたが、このままだとどのカードが誰のカードかわからないので、ユーザー名を表示するようにしてみます。

カードコンポーネントに持たせるつもりで変数を用意してましたが、カートの下に名前を表示したくなったので、そちらの変数は今回利用しないことにします。

それでは以下のようにユーザー名を配置しましょう。

```diff
           <ion-row>
             <ion-col *ngFor="let i of [1,1,1,1,1,1,1,1,1]" size-lg="2" size-md="3" size-sm="2" size="3">
               <app-poker-card userName="uname" number="1" userColor="primary" [isOpen]="false"></app-poker-card>
+              <!-- ユーザー名 -->
+              <div color="primary" class="ion-text-center text-ellipse">uname</div>
             </ion-col>```
```
長い名前は省略表示して表示したいので、CSSを追加します。
`src/app/poker/room/room.page.scss`

```diff
+
+.text-ellipse {
+  overflow: hidden;
+  text-overflow: ellipsis;
+  white-space: nowrap;
+}
```

こうすると以下のようになります。

![ユーザー名追加](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-21/images/add-user-name.png)

※footerのカードが中央に来ているのはカードコンポーネントのスタイルを変更しているからです。(ウィンドウサイズを変更すると左に寄っていたので)

背景とか文字色とか変更したほうがいいのでしょうけど、めんどいので今回はこれで行きます。

これでプレイエリアの見た目は大体固まりました！やったね！

## 手札配置

最後にサクッと手札をfooterに追加しておきましょう。
`src/app/poker/room/room.page.html`
```diff
       <ion-footer>
-        <app-poker-card userName="uname" number="1" userColor="primary" [isOpen]="false"></app-poker-card>
+        <div scrollX="true" class="hand-area">
+          <app-poker-card class="hand-card" userName="uname" number="{{num}}" userColor="primary" [isOpen]="true"  *ngFor="let num of ['0', '1/2', '1', '2', '3', '5', '8', '13', '20', '40', '100', '∞', '?']"></app-poker-card>     
+        </div>
       </ion-footer>
```

手札を横に並べてスクロールできるようにCSSを記載します。
`src/app/poker/room/room.page.scss`

```diff
+.hand-area {
+  height: 120px;
+  display: flex;
+  display: -webkit-flex;
+
+  .hand-card {
+    float: left;
+    margin: 5px;
+  }
+}
+
+// 今回はXだけあればいいけど、両方定義しておく
+div[scrollx=true],div[scrolly=true] {
+  position: relative;
+  overflow: hidden;
+}
+
+div[scrollx=true] {
+  overflow-x: auto;
+}
+
+div[scrolly=true] {
+  overflow-y: auto;
+}
```

こんな感じになります。
![プレイエリア](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-21/images/playarea.png)

## おわりに

Responsive Gridの実装に詰まったのとプライベートが忙しくなったのが影響して途中で止まってましたが、やっと続きができました。

今回の休み中に一気に進めたいなぁ、と思ってます。
次の項目は、プランニングポーカーのゲーム部分を進めていきたいですね。

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
|12/22|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-22)|
|12/23|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-23)|
|12/24|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-24)|
|12/25|[終わってみて？](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-25)|


