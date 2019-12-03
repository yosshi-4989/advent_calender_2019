# アドベントカレンダー全部俺2019…をやりたかった

去年、[先輩がアドベントカレンダーを一人でしていた](https://medium.com/escle/%E3%82%A2%E3%83%89%E3%83%99%E3%83%B3%E3%83%88%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC%E5%85%A8%E9%83%A8%E4%BF%BA2018%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81-2b85619096ff)。面白そうだったけど、去年はネタがなかったしやらなかった。今年は何となくやりたいなと思っていたけど、気づいたら初日が終わってた！

なんか悔しいけど、やってみたい欲はあるので1日遅れで初めます。

# 本日のコンテキスト[Ionicアプリが表示されるまでと最初のサンプルプロジェクト]

今日はタスクリストアプリ作成を通してIonicの基礎的な部分を学習していく。

## 目次

1. [Ionicの基本](#Ionicの基本)
1. [タスクリストアプリ作成](#タスクリストアプリ作成)
1. [](#)
1. [おわりに](#おわりに)

## Ionicの画面描画の流れ

Ionicアプリで画面が描画されるまでを追ってみる。

まずは一番おおもとになるHTMLファイルを確認する。

```html:src/app/index.html
<!DOCTYPE html>
<html lang="en">

<head>
  (headは省略)
</head>

<body>
  <app-root></app-root>
</body>

</html>
```

bodyタグにある`<app-root>`が横、縦に100%となってこの中にアプリケーションが描画されていくことになる模様。
以下のように修正することでアプリケーションのコンテンツが表示されるまで「Loading...」というただのテキストが表示されるようになる。

```diff
-  <app-root></app-root>
+  <app-root>Loading...</app-root>
```

次にメインとなるJSファイル。

```typescript:src/app/main.ts
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
```

`enableProdMode`は実行環境をproductionモードにするオブジェクトで`platformBrowserDynamic`はアプリとして起動するためのオブジェクト。
`enableProdMode`を有効にするか確認するために`environment`を読み込んであり、実際に起動するアプリ(モジュール？)を読み込むために`AppModule`を読み込んでいることがわかる。
※ちなみにここまではAnguarの構造でIonicではないっぽい。

じゃあ、実際に読み込んでるアプリケーションってなんなの？ってことで`src/app/`配下を見ていく。
ということで読み込んでる`app.module.ts`を確認。

```typescript:src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

`app.module.ts`では、アプリ内で利用する機能を登録している…とのこと。
Angularではページやコンポーネントをモジュール単位で扱うので、ページを追加するなどで新しいファイルを作成しても`@NgModule`に登録しないと動かない。

`@NgModule`のbootstrapに指定されているモジュールが立ち上がるページになる。上記の例だと`bootstrap: [AppComponent]`の`AppComponent`に当たる。
(`@NgModule`の他の内容については後で説明されるのかな？なかったら調べてみるのもありか。呼び出し元の関数名が`bootstrapModule()`だから`bootstrap`を呼び出しているのは直感的。)

ということで`AppComponent`を呼び出しているので、`import { AppComponent } from './app.component';`から`app.component.ts`を確認してみましょ。
※ちなみに同じディレクトリに`app.component.html`があるけど、当然JSファイルの`app.component.ts`が読み込まれるっす。(何となく書いて頭に入れといたほうがいい気がしたので明記する)

```typescript:src/app/app.component.ts
import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  public appPages = [
    {
      title: 'Home',
      url: '/home',
      icon: 'home'
    },
    {
      title: 'List',
      url: '/list',
      icon: 'list'
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
```

注目するべきはここ。

```typescript
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
```

`@Component`の`templateUrl`に指定されているHTMLファイルが呼び出されて画面に表示されることになる。
上記の例だと`app.component.html`を呼び出すことになる。
(`@Component`の`selecter`で指定している`app-root`は`src/index.html`の`<app-root>`を指しているんだろうな、と思った。この辺りはAngularを学ぶとわかるんだろうな。)

ということで、アプリの画面が表示されるまでに、

```
src/index.html
-> src/main.ts
-> src/app/app.module.ts
-> src/app/app.component.ts
-> src/app/app.component.html
```

という流れで読み込みをする流れになる。
ちなみにこの流れでIonicのモジュールはかかわってきていないので、すべてAnguarの仕様なのだ！多分！

※参考：[[Angular] Angular アプリの構成をみる](https://qiita.com/ksh-fthr/items/d040cf8b2d15bd7e507d)

## 画面レイアウト

実際に表示される画面のソースコードを少し読んでみる。

```html :src/app/app.component.html
<ion-app>
  <ion-split-pane contentId="main-content">
    <ion-menu contentId="main-content" type="overlay">
      <ion-header>
        <ion-toolbar>
          <ion-title>Menu</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-menu-toggle auto-hide="false" *ngFor="let p of appPages">
            <ion-item [routerDirection]="'root'" [routerLink]="[p.url]">
              <ion-icon slot="start" [name]="p.icon"></ion-icon>
              <ion-label>
                {{p.title}}
              </ion-label>
            </ion-item>
          </ion-menu-toggle>
        </ion-list>
      </ion-content>
    </ion-menu>
    <ion-router-outlet id="main-content"></ion-router-outlet>
  </ion-split-pane>
</ion-app>
```

まず注目する形。

```html
  <ion-split-pane contentId="main-content">
    <ion-menu contentId="main-content" type="overlay">
        (中略)
    </ion-menu>
    <ion-router-outlet id="main-content"></ion-router-outlet>
  </ion-split-pane>
```

`<ion-split-pane>`は幅が狭いと`contentId`で指定されたコンテンツ以外(予想※)を省略し、幅が広いと表示してくれるコンポーネント。
<br/>
※サンプルコードを見たところの所感。3つ以上の時に本当にその挙動をするか未検証。
<br/>
今回は`<ion-menu>`と`<ion-router-outlet>`の2つの要素があり、`<ion-router-outlet>`のidが指定されているので`<ion-menu>`が省略される。

※参考：[ion-split-pane - Ionic Framework 日本語ドキュメンテーション](https://ionicframework.com/jp/docs/api/split-pane)

次に、`<ion-menu>`内のこれに注目。

```
          <ion-menu-toggle auto-hide="false" *ngFor="let p of appPages">
            <ion-item [routerDirection]="'root'" [routerLink]="[p.url]">
              <ion-icon slot="start" [name]="p.icon"></ion-icon>
              <ion-label>
                {{p.title}}
              </ion-label>
            </ion-item>
          </ion-menu-toggle>
```

`*ngFor`の記法とかもあるけど、今回は`<ion-item [routerDirection]="'root'" [routerLink]="[p.url]">`について、`[routerDirection]`と`[routerLink]`はURLルーティングのディレクティブとのこと。
これによってこの要素をクリックした際にルーターのrootの中身を`p.url`に書き換えることができる。
今回だとrootが`<ion-router-outlet>`らしいんだけど、~~これも`<ion-menu>`の`contentId`で指定されているからなんだろうか？~~[ドキュメント](https://ionicframework.com/jp/docs/api/router-outlet)によるとルーティングする対象が`<ion-router-outlet>`で指定されているっぽい。(Angular以外は`<ion-router>`)

最後に`<ion-router-outlet>`の中身を確認するためにルーティング周りを確認する。
`app.module.ts`によると下記のようにモジュールを読み込んでいる。

```typescript:src/app/app.module.ts
・・・
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule
・・・
```

`app-routing.module.ts`を確認してみる。

```typescript :src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'list',
    loadChildren: () => import('./list/list.module').then(m => m.ListPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
```

`routes`が定義されていて、RouterModuleに登録されている。pathはURLのパスを表しており、他の要素はそれぞれの処理(リダイレクト、モジュール読み込み)を表している。

あとはそれぞれのスクリプトファイルから読み込むHTMLファイルを特定すればOK。

## タスクリストアプリ作成

ということでやっとこさタスクリストアプリ作成に入る…と思ったけど結構長くなったので終わり！
[diffのリンク](https://github.com/yosshi-4989/advent_calender_2019/compare/2019-12-03..2019-12-04)と画面だけ張って終わり！
<br>
※diffのリンク先はアプリだけじゃなくREADMEのdiffも含まれることに注意。
※画像は左から「タスク登録画面」「ページメニュー」「タスク一覧画面」「タスク操作メニュー」「タスク編集ダイアログ」のキャプチャ

![タスクリストアプリ画面キャプチャ](https://github.com/yosshi-4989/advent_calender_2019/blob/images/task-list-view.png)

## おわりに

良い点：Ionic(Angular)アプリの画面が表示されるまでの流れをちゃんと追ったことがなかったので、まだちゃんと理解はしてないけどいい学びの機会になったと思う。
<br>
悪い点：アプリ開発について特に書けなかった。

アプリ開発の項目をスキップしてしまったのは少し反省。ただ、アプリを作る部分をそのまま載せても何も面白くないので、アプリが表示されるまでを追うことができたのはよかったと思う。

明日はもう少しちゃんとやれたらいいな(笑)

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


