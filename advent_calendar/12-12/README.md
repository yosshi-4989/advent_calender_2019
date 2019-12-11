# アドベントカレンダー全部俺2019…をやりたかった

去年、[先輩がアドベントカレンダーを一人でしていた](https://medium.com/escle/%E3%82%A2%E3%83%89%E3%83%99%E3%83%B3%E3%83%88%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC%E5%85%A8%E9%83%A8%E4%BF%BA2018%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81-2b85619096ff)。面白そうだったけど、去年はネタがなかったしやらなかった。今年は何となくやりたいなと思っていたけど、気づいたら初日が終わってた！

なんか悔しいけど、やってみたい欲はあるので1日遅れで初めます。

# 本日のコンテキスト[自動デプロイと書籍を終えて]

昨日まででアプリケーションが3つできました！ただ、アプリケーションを作成しても後悔しないと意味がありません。
今日はNetlifyへの自動デプロイを実施し、Webアプリの公開方法をまとめます。

## 目次

1. [Netlifyへデプロイ](#Netlifyへデプロイ)
1. [おわりに](#おわりに)

## Netlifyへデプロイ

Netlifyとは静的なサイトをホスティングできるサービスです。無料枠があり、小規模の個人開発であれば無料の範囲内で利用できる…と思います。そんなNetlifyへのデプロイ設定を行いましょう。

まずNetlifyへログインします。(アカウント登録はGithubのアカウントを利用できるので難しくないと思います。)
<br>そしてログイン後の画面にある「New site from Git」ボタンを押すと、デプロイするGitリポジトリを選択する画面が表示されます。

![ログイン後の画面](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-12/images/netlify-new-site.png)

![サイト作成](https://github.com/yosshi-4989/advent_calender_2019/blob/master/advent_calendar/12-12/images/create-a-new-site.png)

今回はGithubのリポジトリを利用するのでGithubのボタンを押します。
<br>するとデプロイするリポジトリの選択になるのでリポジトリを選択します。
<br>※デプロイするリポジトリがない場合は、Githubアカウントがあっているか確認したうえで、「Configure the Netlify app on GitHub.」を押してGithubの設定からNetlifyがアクセスできるリポジトリに制限がかかっていないかを確認してみてください。

今回はこのアドベントカレンダーのリポジトリを選択してみました。

そして「Branch to deploy」にmaster(もしくはデプロイしたいブランチ)、「Build command」に以下のコマンド記入、「Publish directory」に`www/`を入力して、「Deploy site」ボタンをクリックするとビルドが始まります。

```
npm run build -- --prod && echo '/* /index.html 200' >> www/_redirects
```

ちなみに、`npm run build -- --prod`はWebアプリ向けにAOTビルドするコマンドで、`echo '/* /index.html 200' >> www/_redirects`はSPAで全てのアクセスを公開ディレクトリのindex.htmlで受けないといけないために必要な設定を記載しています。
<br>Netlifyではカレントディレクトリに `package.json`がある場合、自動で `npm install`してくれるそうなのでライブラリのインストールは省略されています。

ビルドが完了したらsiteのoverview等にあるURLにアクセスしてアプリケーションが表示されれば完了です！
ここまでできると、Githubの指定したブランチにpushをするとNetlifyがpushを検知して自動でデプロイを行ってくれます。便利ですね！

### ※補足

今回、私はアドベントカレンダーのリポジトリをデプロイしたのでカレントディレクトリではなく、`chat-tutorial`ディレクトリの下にアプリケーションが存在します。
そのため上の方法ではビルドできないので「Build command」、「Publish directory」をそれぞれいかに変更してビルドしています。

```
Build command: cd chat-tutorial && npm install && npm run build -- --prod && echo '/* /index.html 200' >> www/_redirects
Publish directory: chat-tutorial/www/
```

参考として載せましたが、明らかに無駄なファイルが多いのでマネしないようにしてください。

## おわりに

以上で[Ionicで作る モバイルアプリ制作入門[Angular版]<Web/iPhone/Android対応>](https://www.amazon.co.jp/gp/product/4863542925)のざっくり読み進めを終わります。

最後のチャットアプリは正直思っていたよりもちゃんとしたものが出来上がり、また以前チャレンジしたときにうまくいかず挫折していたFirebaseを利用する方法が何となくですがつかめたので、個人的には値段以上の価値がありました。マジですごい。

まだまだJS処理部分で理解できていないところもありますが、プランニングポーカーを作っていく中で作成する流れが一部ですがはっきりとできたのでこれからが楽しみです。

明日は、プランニングポーカー事始めということで軽くどんなものを作成するかのイメージを描いてみようかなと思ってます。

それではまた明日！

## おまけ

なんかNetlifyへのデプロイのセクションでAngularアプリのPWAを有効化する方法が記載されていたからメモ程度に記載しておく。

```
$ npx ng add @angular/pwa
```

以上終わり。簡単だね。Gitに作成されたファイルをコミットしてプッシュすればNetlifyに適用されるますね。

コマンドの説明をメモすると
- npxはローカルパッケージを実行する
- npx ng でAngular CLIを実行
- add @angular/pwa でパッケージのインストールとプロジェクトの適用を自動でしてくれる
  [自動適用内容]
  - ngsw-config.json(独自サービスワーカー設定)の作成
  - src/manifest.webmanifest(アプリの設定ファイル)の作成
  - src/assets/icon/*(アプリアイコン)の作成
  - angular.json, package.json, src/app/app.module.ts, src/index.htmlの更新
となるらしい。

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


