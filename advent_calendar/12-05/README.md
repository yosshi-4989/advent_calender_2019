# アドベントカレンダー全部俺2019…をやりたかった

去年、[先輩がアドベントカレンダーを一人でしていた](https://medium.com/escle/%E3%82%A2%E3%83%89%E3%83%99%E3%83%B3%E3%83%88%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC%E5%85%A8%E9%83%A8%E4%BF%BA2018%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81-2b85619096ff)。面白そうだったけど、去年はネタがなかったしやらなかった。今年は何となくやりたいなと思っていたけど、気づいたら初日が終わってた！

なんか悔しいけど、やってみたい欲はあるので1日遅れで初めます。

# 本日のコンテキスト[WordPressと連携してみる]

今日はWordPressのAPIを利用してWordPressのブログを表示するアプリケーションを作成していく。
また、このアプリケーション作成を通してIonicで外部APIと連携する方法を学ぶ。

## 目次

1. [WordPressのAPI](#WordPressのAPI)
1. [Ionicで外部APIをたたく](#Ionicで外部APIをたたく)
1. [ページ遷移時に値を受け渡す](#ページ遷移時に値を受け渡す)
1. [出来上がったアプリケーション](#出来上がったアプリケーション)
1. [おわりに](#おわりに)

## WordPressのAPI

アプリケーションを作成する前にWordPressの(今回利用する)APIについて軽くまとめておく。

今回利用するAPIは以下の2つ
- [記事一覧を取得するAPI](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/posts/)<br>
URL：`https://public-api.wordpress.com/rest/v1.1/sites/$site/posts/`
- [記事の詳細を取得するAPI](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/posts/%24post_ID/)<br>
URL：`https://public-api.wordpress.com/rest/v1.1/sites/$site/posts/$post_ID`

この時、`$site`には記事を取得したいサイトのURL(ドメイン)を、`$post_ID`には記事のIDを入れる。
[今回学習に利用している本](https://www.amazon.co.jp/dp/4863542925/)では`ionicjp.wordpress.com`というサイトを用意しているので次節以降は`$site`にこのサイトを利用する。

記事一覧を取得するAPIを叩くと以下の形式のJSONを取得することができる。
今回はpostsのtitleとdateを利用して一覧を表示、IDを利用して記事の詳細を取得する。

```json
{
  "found": "記事の取得件数",
  "posts": [
    {
        "ID": "記事のID",
        "title": "タイトル",
        "content": "本文",
        "date": "登録日",
        ...
    }, {
        ...
    }
  ]
}
```

記事の詳細を取得するAPIは以下の形式のJSONを取得することができる。
上記の記事一覧postsの要素のうち`$post_ID`で指定したIDと一致する記事のみ取得できるので、title、content、dateを利用して記事詳細を表示する。

```json
{
  "ID": "記事のID",
  "title": "タイトル",
  "content": "本文",
  "date": "登録日",
    ...
}
```

それぞれの省略された要素は今回扱わないので興味があれば[WordPressの公式サイト](https://developer.wordpress.com/docs/api/)を確認してみてね。

## Ionicで外部APIをたたく

WordPress用のアプリケーションとして、新規にプロジェクトを開始する。
この時のテンプレートはblankを選択した。

外部APIをたたくためにはHTTP通信をする必要があるので、まず`src/app/app.module.ts`で`HttpClientModule`をimportする。

```diff
  ...
+ import { HttpClientModule } from '@angular/common/http';

  @NgModule({
    declarations: [AppComponent],
    entryComponents: [],
-    imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
+    imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule],
    providers: [
    ...
```

これで`HttpClient`を利用することができるようになったのでページを表示するときに記事一覧を取得するように`src/app/home/home.page.ts`を書き換える。

```typescript
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  // コンストラクタでHttpClientをhttpに入れる
  constructor(public http: HttpClient) {}

  ionViewDidEnter() {
    // ページ表示完了後に記事リストを取得しに行く
    this.http.get('https://public-api.wordpress.com/rest/v1.1/sites/ionicjp.wordpress.com/posts/')
      .subscribe(data => {
        // 取得したデータに対して処理を行う
      });
  }
}
```

今回のアプリケーションでは記事一覧を格納するpostsを定義してそこに追加する処理を実装した。後は取得した記事を表示するようにHTMLを修正すればOKなので省略。

ちなみに表示するときに`<ion-card>`を利用して以下のようにしてた。
それっぽいね！

![記事一覧ページ](https://github.com/yosshi-4989/advent_calender_2019/blob/images/posts-list.png)


## ページ遷移時に値を受け渡す

記事一覧画面が表示できたので、次に選択した記事の詳細ページを表示する機能を実装する。
詳細ページが必要なので、`article`というページを事前に作成しておく。

まず、一覧画面から詳細画面への遷移を考える。
ページを作成した際に自動的にURLのルーティンに`article`が追加されるので、`src/app/home/home.page.ts`の記事の要素(`<ion-card>`)に`routerLink="/article"`を付けてやればページ遷移はできる。

ただ、この方法だと記事のIDを渡すことができない。どうやって渡すかというと、以下のように編集する。

```diff
-  <ion-card *ngFor="let p of posts">
+  <ion-card *ngFor="let p of posts" routerLink="/article/{{p.ID}}">
```

こうすると、`/article`からURLルーティングによって`src/app/article/article.module.ts`を読み込み、`/{{p.ID}}`を渡すことができる。
ただ、現状`article`側で受け取る設定をしていないのでこのままではエラーになる。

`article`側では`src/app/article/article-routing.module.ts`の`path`へ`:[変数名]`の形式で設定することで受け取り可能になる。今回は`:articleId`で指定した。

```typescript
const routes: Routes = [
  {
    path: ':articleId',
    component: ArticlePage
  }
];
```

これで`/{{p.ID}}`と`:articleId`が結びつくようになり、結びついたときに`ArticlePage`を呼び出す。

最後に`ArticlePage`内で`:articleId`を呼び出す方法を示す。
といっても以下のように`src/app/article/article.page.ts`を修正するだけ。

```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-article',
  templateUrl: './article.page.html',
  styleUrls: ['./article.page.scss'],
})
export class ArticlePage implements OnInit {
  ID: number; // 取得した値を格納する変数

constructor(public route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap
      .subscribe((params: ParamMap) => {
        // paramsに含まれるarticleIdを数値に変換して格納する
        this.ID = parseInt(params.get('articleId'), 10);
      });
  }
}
```

これで記事のIDを受け取ることができので、あとは[Ionicで外部APIをたたく](#Ionicで外部APIをたたく)でやったようにAPIをたたいて変数に格納し、画面に表示すれば出来上がり。

余談だが、WordPressのcontentにはHTMLが格納されているので今まで通り`{{post.content}}`で表示するとHTMLがサニタイズされて表示される。(HTMLタグ等がそのまま表示される。)サニタイズせずに表示するためにはcontentを表示する`<div>`タグのattributeに`[innerHTML]="post.content"`と記載することでHTMLを反映した表示にすることができる。ただし、HTMLをそのまま反映するような処理にすると悪意のあるコードを仕込まれてセキュリティーの問題につながるため、注意する。

## 出来上がったアプリケーション

というわけでWordPressから記事を取得して一覧、詳細を表示するアプリケーションができました。

[記事一覧画面作成作業内容](https://github.com/yosshi-4989/advent_calender_2019/compare/16966c67a6a18617a15d12d751c1141b6ddea141..e407d9cf94d0089f5b9cbb05ff85e6d12708dece)と[記事詳細画面作成作業内容](https://github.com/yosshi-4989/advent_calender_2019/compare/e407d9cf94d0089f5b9cbb05ff85e6d12708dece..8c06ff35a508a4d301a120e275908b9e0312c4b4)のdiffとおまけで[UXを高める修正](https://github.com/yosshi-4989/advent_calender_2019/compare/8c06ff35a508a4d301a120e275908b9e0312c4b4..59f0a2ce7f53dcb8d01f56b15c95c68d4722abfc)があったのでそれぞれのdiffへリンクしておく。

画面はこんな感じになった。左が一覧画面で右が詳細画面。

![WordPress記事表示アプリケーション](https://github.com/yosshi-4989/advent_calender_2019/blob/images/wordpress-application.png)

## おわりに

今日はアプリケーション開発がメインだったけど、開発内容を記載するというより、機能を実装する上で主題となっている項目に着目した記事になるように意識してみた。ソースコードそのまま載せるよりも特定の項目に焦点を当てていこうかなって思った。

書籍も4章まで終わった。5章はリファクタリング。コードを共通化したりモジュールを統一したりするっぽい？明日も楽しみだ。

# アドベントカレンダー

|日付|タイトル|
|-----|------|
|12/02|[アドベントカレンダーやる宣言](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-02)|
|12/03|[Ionic環境構築](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-03)|
|12/04|[Ionicアプリが表示されるまでと最初のサンプルプロジェクト](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-04)|
|12/05|[WordPressと連携してみる](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-05)|
|12/06|[リファクタリング！](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-06)|
|12/07|[Capacitorを使ってみる](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-07)|
|12/08|[Firebaseを使ってチャットアプリ①](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-08)|
|12/09|[Firebaseを使ってチャットアプリ②](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-09)|
|12/10|[自動デプロイと書籍を終えて](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-10)|
|12/11|[プランニングポーカー事始め](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-11)|
|12/12|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-12)|
|12/13|[未定](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-13)|
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


