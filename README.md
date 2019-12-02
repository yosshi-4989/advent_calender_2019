# アドベントカレンダー全部俺2019…をやりたかった

去年、[先輩がアドベントカレンダーを一人でしていた](https://medium.com/escle/%E3%82%A2%E3%83%89%E3%83%99%E3%83%B3%E3%83%88%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC%E5%85%A8%E9%83%A8%E4%BF%BA2018%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81-2b85619096ff)。面白そうだったけど、去年はネタがなかったしやらなかった。今年は何となくやりたいなと思っていたけど、気づいたら初日が終わってた！

なんか悔しいけど、やってみたい欲はあるので1日遅れで初めます。

# 本日のコンテキスト

今日はIonicの環境構築の手順をまとめる！

## 目次

1. [構築環境](#構築環境)
1. [Node.jsインストール](#Node.jsインストール)
1. [Ionic CLIインストール](#Ionic CLIインストール)
1. [Gitインストール](#Gitインストール)
1. [Visual Studio Codeインストール](#Visual Studio Codeインストール)
1. [サンプルプロジェクトを作ってみる](#サンプルプロジェクトを作ってみる)
1. [おわりに](#おわりに)
1. [TIPS](#TIPS)

## 構築環境

- Git: version 2.17.0.windows.1
- Node.js: v12.13.1
- Ionic CLI: ionic@5.4.9
- エディタ: VSCode

※Xcode, Android Studioはスマホアプリ用にビルドすることを考えてないのでスキップする。

## Node.jsインストール

[Node.jsの公式サイト](https://nodejs.org/ja/)からインストーラをインストールしてインストールする。
インストール後、以下のコマンドで正しいバージョンが表示されればOK。

```
> node -v
v12.13.1
```

## Ionic CLIインストール

次にIonic CLIをインストールする。
インストールは以下のコマンドでできる

```
> npm install ionic -g
> ionic -v
5.4.9
```

せっかくなのでnpm installコマンドのオプションについて一部メモ

- "--global(-g)": グローバル領域にインストール。CLIは共通でいいから -g を付けた？
- "--save(-S)": package.jsonのdependenciesにバージョン付きで追記する。プロジェクトにかかわるパッケージをインストールする場合は必ずつけたほうがいいね。デフォルトでオンになっているとの記述もある…

## Gitインストール

Gitも開発で必要なので入ってない場合は[Gitの公式サイト](https://git-scm.com/download)からインストーラをダウンロードしてインストールする。

```
> git --version
git version 2.17.0.windows.1
```

## Visual Studio Codeインストール

IDE/エディタは無料かつIonicの開発をサポートできるのでVSCode一択。
[VSCodeの公式サイト](https://code.visualstudio.com/)からインストーラをダウンロードしてインストールする。(こればっかだな)

そしてVSCodeのインストールが終わったら起動してIonic開発をサポートする拡張機能をインストールする。
下記画像の赤枠のボタンを押して検索窓に「Angular Language Service」と入力すると、黄枠の拡張機能が表示されるので、インストールする。

[Angular拡張機能](https://github.com/yosshi-4989/advent_calender_2019/blob/images/Angular%E6%8B%A1%E5%BC%B5%E6%A9%9F%E8%83%BD.png)

以上で環境構築終わり。

## サンプルプロジェクトを作ってみる

環境構築が終わったのでとりあえずサンプルプロジェクトを作って動くことを確認する。
※プロジェクト名は明日も利用するために`tasklist-tutorial`にする

```
> ionic start --type=angular
? Project name: tasklist-tutorial
? Starter template:
  tabs         | A starting project with a simple tabbed interface
> sidemenu     | A starting project with a side menu with navigation in the content area 
  blank        | A blank starter project
  my-first-app | An example application that builds a camera with gallery
  conference   | A kitchen-sink application that shows off all Ionic has to offer        

[INFO] Next Steps:

       - Go to your newly created project: cd .\tasklist-tutorial
       - Run ionic serve within the app directory to see your app
       - Build features and components: https://ion.link/scaffolding-docs
       - Run your app on a hardware or virtual device: https://ion.link/running-docs
```

作成が終わったのでサンプルプロジェクトを起動してみる。

```
> cd ./tasklist-tutorial
> ionic serve
```

[Ionicアプリ起動](https://github.com/yosshi-4989/advent_calender_2019/blob/images/run-first-project.png)

アプリが起動した！

## おわりに

今日は環境構築のみでした。
明日から実際にアプリ開発もどきができるかな。
チュートリアルだし、そのままというよりかはIonicについてちょっと深堀した内容を記載できるように意識してみようと思いますです。

## Tips

- VSCodeでMarkdownを書くときは[Ctrl + k] -> [v]でプレビュー画面が表示できる。
- WindowsでNode.jsのバージョン管理をしたい場合、[nvm(node version manager)](https://github.com/coreybutler/nvm-windows)というアプリ(ライブラリ？)を使うらしい。

# アドベントカレンダー

|日付|タイトル|
|-----|------|
|12/02|[アドベントカレンダーやる宣言](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-02)|
|12/03|[Ioic環境構築](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-03)|
|12/04|[Ionicの基本と初めての開発](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-04)|
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


