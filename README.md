# アドベントカレンダー全部俺2019…をやりたかった

去年、[先輩がアドベントカレンダーを一人でしていた](https://medium.com/escle/%E3%82%A2%E3%83%89%E3%83%99%E3%83%B3%E3%83%88%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC%E5%85%A8%E9%83%A8%E4%BF%BA2018%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81-2b85619096ff)。面白そうだったけど、去年はネタがなかったしやらなかった。今年は何となくやりたいなと思っていたけど、気づいたら初日が終わってた！

なんか悔しいけど、やってみたい欲はあるので1日遅れで初めます。

# 本日のコンテキスト[リファクタリングしよう！]

今日はリファクタリングの5章。書籍も折り返しです。ちょっとずつ疲れがたまってきてますが元気に始めていきましょう。

## 目次

1. [Serviceを使ってみよう！](#Serviceを使ってみよう！)
1. [型を共通化しよう！](#型を共通化しよう！)
1. [カスタムコンポーネントを作ってみよう！](#カスタムコンポーネントを作ってみよう！)
1. [おわりに](#おわりに)

## Serviceを使ってみよう！

HTTP通信はサービスで行うことが一般的らしいのでWordPressからデータを取ってくる処理をサービスに移設します！
ん？サービスって何？

本には
>Ionicでは、別のファイルに処理を書く方法として、「サービス」(Dependency Injectionという概念で設計された、コード同士の依存性を低くして汎用性を持たせるための仕組み)を用意しています。

と書かれてます。
<br>なるほどわからん。

じゃあ、Dependency Injectionってなんぞ？を調べてみるか、ってことで[この記事](http://blog.a-way-out.net/blog/2015/08/31/your-dependency-injection-is-wrong-as-I-expected/)とか[この記事](https://qiita.com/hshimo/items/1136087e1c6e5c5b0d9f)とか読んでみた。
<br>
つまるところ、とあるクラス(ライブラリ)を保持してるクラス(処理)を作成(=依存関係を持つ)すると依存してるクラスを置き換えたり修正するとそれに応じて修正も大変になるから、一か所にまとめてそこから呼び出すようにしようぜってことだな！？(説明力)

んで、Ionicのサービスはそれをなんかこううまくやることができる機能ってことだな！？(語彙力)

んじゃとりあえずやってみよう。まずはサービスの作成から。

```
$ ionic g service wordpress
```

こんなファイルができた。`Injectable`はクラスをサービスとして扱うためのものらしい。

```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WordpressService {

  constructor() { }
}
```

んじゃHTTP通信してるコードを集めてきましょ。

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WordpressService {

  constructor(public http: HttpClient) { }

  getPosts() {
    return this.http.get('https://public-api.wordpress.com/rest/v1.1/sites/ionicjp.wordpress.com/posts/');
  }

  getArticle(id: number) {
    return this.http.get<{
      ID: number;
      title: string;
      content: string;
      date: string;
    }>('https://public-api.wordpress.com/rest/v1.1/sites/ionicjp.wordpress.com/posts/' + id)
  }
}
```

ほい、あとはこのサービスクラスをHttpClientの代わりにimportしてgetしてるか所を該当メソッドに変更すれば完成！

これで、もしWordPressのAPIのURLが変わったとしてもこのファイルのURLを変更すれば全体に適用されるから安心だね！

subscribeをサービスに入れてないのは処理の内容は各ページで行ったほうが扱いやすいのでそうしてるっぽいね。ブロックの中の処理もこっちに持ってきちゃうと汎用性が下がるから、これがよさそう。

## 型を共通化しよう！

記事の型postは以下の通り
```typescript
post: {
  ID:number,
  title: string,
  content: string,
  date: string,
}
```

ただ、これを毎回記載するのはめんどいし冗長なので、共通の型を作成して管理する。

```
$ ionic g
? What would you like to generate?       
> interface
? Name/path of interface: interfaces/post
```

これで`src/app/interfaces/post.ts`が作成されるので、型を定義していく。ちなみに他のクラスとの重複を避けるために頭にIを付けて`IPost`とする。

```typescript
export interface IPost {
    ID: number;
    title: string;
    content: string;
    date: string;
}
```

あとは、IPostをimportしてpostの型定義部分をIPostに変更して完了！
すっきりするね！

```diff
# 例えばこんな感じ
+ import { IPOST } from '../interfaces/post';

- posts: {
-    ID: number;
-    title: string;
-    content: string;
-    date: string;
- }[] = [];
+ posts: IPost[] = [];
```

## カスタムコンポーネントを作ってみよう！

Ionicでは(他のフレームワークでもできるだろけど)コンポーネントを自作してオリジナルのタグを使うことができる。

というわけでオリジナルタグを作成してみよ！

1つのコンポーネントに対して1つのモジュールしか登録できないらしい。そのため複数のモジュール(今回だと`home.module.ts`と`article.module.ts`)に登録するためには、1つのモジュールに登録して他のモジュールで登録したモジュールを読み込む、という手続きが必要らしい。

なので、まずコンポーネント登録用のモジュールを作成してみる。

```
$ ionic g
? What would you like to generate? module
? Name/path of module: shared
```

これで`src/app/shared.shared.module.ts`が作成される。Ionicのコンポーネントを利用したいので`@NgModule`の`imports`に`IonicModule`を追加しておいてね。

```diff
  import { NgModule } from '@angular/core';
  import { CommonModule } from '@angular/common';
+ import { IonicModule } from '@ionic/angular';

  @NgModule({
  declarations: [],
  imports: [
+   IonicModule,
    CommonModule
  ]
  })
  export class SharedModule { }
```
同様に`home.module.ts`と`article.module.ts`に`SharedModule`を追加することでこの後作成・追加するコンポーネントを利用することができるようになる。

登録するmoduleができたので、さっそくコンポーネントを作ってみる。

```
$ ionic g
? What would you like to generate? component
? Name/path of component: shared/wp-head
```

`src/app/shared/wp-head/`に作成されたコンポーネントが配置されるのでこれを`SharedModule`に登録する。

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { WpHeadComponent } from './wp-head/wp-head.component';

@NgModule({
  // 使用コンポーネントの宣言
  declarations: [WpHeadComponent],
  // 他コンポーネントで使用可能にする宣言
  exports: [ WpHeadComponent ],
  imports: [
    IonicModule,
    CommonModule
  ]
})
export class SharedModule { }
```

んじゃ、実際にコンポーネントを作っていきますか。`src/app/shared/wp-head/wp-head.component.html`を以下に書き換える。

```html
<ion-card-header>
  <ion-card-subtitle>
    {{date | date: "yyyy年MM月dd日"}}
  </ion-card-subtitle>
  <ion-card-title>{{title}}</ion-card-title>
</ion-card-header>
```

titleとdateは呼び出した側が書き換えられるようにしたいので、`src/app/shared/wp-head/wp-head.component.ts`にInputを追加する。

```typescript
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-wp-head', // ここで指定した値がタグ名になる
  templateUrl: './wp-head.component.html',
  styleUrls: ['./wp-head.component.scss'],
})
export class WpHeadComponent implements OnInit {
  // プロパティの追加
  @Input() title: string;
  @Input() date: string;

  constructor() { }

  ngOnInit() {}
}
```

ここまでやることで、`<app-wp-head title="{{p.title}}" date="{{p.date}}"></app-wp-head>`と指定すれば呼び出すことができるようになる。
`home.page.html`と`article.page.html`の該当箇所を置換すれば完了！

## おわりに

はい、ということでリファクタリング回終了。これでコードの共通化、型の共通化、タグの共通化ができるようになったね！やったぜ！
<br>実はモジュールをまとめよう、ってセクションもあったんだけど、ArticlePageに関するRoutingをHomePageに移動させるだけってのと力尽きた(こっちがメイン)ので止めた。

明日はCapacitorを使ったモバイルアプリ開発になる…はず？あれ？モバイルか。うーん、スキップするかも！w

それではまた明日！

# アドベントカレンダー

|日付|タイトル|
|-----|------|
|12/02|[アドベントカレンダーやる宣言](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-02)|
|12/03|[Ionic環境構築](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-03)|
|12/04|[Ionicアプリが表示されるまでと最初のサンプルプロジェクト](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-04)|
|12/05|[WordPressと連携してみる](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-05)|
|12/06|[リファクタリングしよう！](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-06)|
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


