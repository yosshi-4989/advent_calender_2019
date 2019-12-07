# アドベントカレンダー全部俺2019…をやりたかった

去年、[先輩がアドベントカレンダーを一人でしていた](https://medium.com/escle/%E3%82%A2%E3%83%89%E3%83%99%E3%83%B3%E3%83%88%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC%E5%85%A8%E9%83%A8%E4%BF%BA2018%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81-2b85619096ff)。面白そうだったけど、去年はネタがなかったしやらなかった。今年は何となくやりたいなと思っていたけど、気づいたら初日が終わってた！

なんか悔しいけど、やってみたい欲はあるので1日遅れで初めます。

# 本日のコンテキスト[Firebaseを使ってチャットアプリ①~ Firebaseとの連携 ~]

今日からチャットアプリを作っていきます。当初想定では2日とか適当においてたけど、内容の意味で切りのいいようにするために4日に分割します！(やったね！)

そんなわけで、今日はIonicのアプリケーションからFirebaseにアクセスできるようにする方法をまとめていきます！

## 目次

1. [Firebaseとの連携](#Firebaseとの連携)
1. [おわりに](#おわりに)

## Firebaseとの連携

まずはIonicプロジェクトを作成する。そしてFirebaseと接続するためのパッケージをインストールする。

```
$ ionic start chat-tutorial tabs --type=angular
$ cd ./chat-tutorial
$ npm install firebase @angular/fire
```

次にFirebaseでプロジェクトを作成する。

Firebaseのコンソール画面から「+プロジェクトの追加」を選択、プロジェクト名を適当につける。(今回はionic-chatにした。)確認画面でGoogleアナリティクスの有効化について聞かれるので設定して続行する。しばらくすると作成されるので、続行を押してプロジェクトに遷移する。

Project Overviewをクリックし、`</>`をクリックしてWebアプリを追加する。アプリ名はionic-chatで。追加するとFirebase SDKの追加にFirebaseのAPIキーを取得できる。

![Firebaseプロジェクトコンソール](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-08/images/firebase-projet.png)
![Firebase SDK](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-08/images/firebase-sdk.png)

取得したAPIキーを`src/environments/environment.ts`と`src/environments/environment.prod.ts`に追加する。

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  firebase: {
    apiKey: 'xxxxxxxxxxxxxxxxxxxxxxxxx',
    authDomain: 'xxxxxxxxxxxxxxxxxxxxxxxxx',
    databaseURL: 'https://xxxxxxxxxxxxxxxxxxxxxxxxx',
    projectId: 'xxxxxxxxxxxxxxxxxxxxxxxxx',
    storageBucket: 'xxxxxxxxxxxxxxxxxxxxxxxxx',
    messagingSenderId: 'xxxxxxxxxxxxxxxxxxxxxxxxx',
    appId: 'xxxxxxxxxxxxxxxxxxxxxxxxx'
  }
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  firebase: {
    apiKey: 'xxxxxxxxxxxxxxxxxxxxxxxxx',
    authDomain: 'xxxxxxxxxxxxxxxxxxxxxxxxx',
    databaseURL: 'https://xxxxxxxxxxxxxxxxxxxxxxxxx',
    projectId: 'xxxxxxxxxxxxxxxxxxxxxxxxx',
    storageBucket: 'xxxxxxxxxxxxxxxxxxxxxxxxx',
    messagingSenderId: 'xxxxxxxxxxxxxxxxxxxxxxxxx',
    appId: 'xxxxxxxxxxxxxxxxxxxxxxxxx'
  }
};
```

最後にインストールしたパッケージとenvironmentsを`src/app/app.module.ts`に追加すれば準備完了。

```typescript
・・・
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from 'src/environments/environment';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
  ],
・・・
```

念のためサービス起動してエラーが出るか確認して問題なければ今日は終了です。

## おわりに

今回はまずFirebaseとつなげるための準備回でした。意味あるかなぁと思いながらマスクは一応して起きました。
FirebaseのAPIキーの配置場所は悩むところだけど、environmentに書く方法もあるのか、など色々勉強になりますね。

軽く7章でやる内容を見たけど、割とがっつりチャットアプリができそうで驚いてる。明日はFirebase Authを使ってログインなどの認証周りを作成していきます。


# アドベントカレンダー

|日付|タイトル|
|-----|------|
|12/02|[アドベントカレンダーやる宣言](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-02)|
|12/03|[Ionic環境構築](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-03)|
|12/04|[Ionicアプリが表示されるまでと最初のサンプルプロジェクト](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-04)|
|12/05|[WordPressと連携してみる](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-05)|
|12/06|[リファクタリングしよう！](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-06)|
|12/07|[~~Capacitorを使ってみる~~JSの非同期処理](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-07)|
|12/08|[Firebaseを使ってチャットアプリ①~ Firebaseとの連携 ~](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-08)|
|12/09|[Firebaseを使ってチャットアプリ②~ 認証ページの実装 ~](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-09)|
|12/10|[Firebaseを使ってチャットアプリ②~ ユーザープロフィールの実装 ~](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-10)|
|12/11|[Firebaseを使ってチャットアプリ②~ チャットの実装 ~](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-11)|
|12/12|[自動デプロイと書籍を終えて](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-12)|
|12/13|[プランニングポーカー事始め](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-13)|
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


