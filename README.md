# アドベントカレンダー全部俺2019…をやりたかった

去年、[先輩がアドベントカレンダーを一人でしていた](https://medium.com/escle/%E3%82%A2%E3%83%89%E3%83%99%E3%83%B3%E3%83%88%E3%82%AB%E3%83%AC%E3%83%B3%E3%83%80%E3%83%BC%E5%85%A8%E9%83%A8%E4%BF%BA2018%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81-2b85619096ff)。面白そうだったけど、去年はネタがなかったしやらなかった。今年は何となくやりたいなと思っていたけど、気づいたら初日が終わってた！

なんか悔しいけど、やってみたい欲はあるので1日遅れで初めます。

# 本日のコンテキスト[~~Capacitorを使ってみる~~JSの非同期処理]

Capacitorを使ったアプリ開発をやるといったな。すまんありゃ嘘だった。CapacitorについてとかIonicプロジェクトのtabsのページレイアウトの話とかアプリアイコンの作成とかスプラッシュ画面の設定とかネイティブ機能の使い方とかGoogle AdMobでの広告の出し方とかいろいろ面白そうな話はあるんですが、Windows開発ですし、Android Studioとか起動するつもりあまりないですし、モバイルアプリ用にビルドとかまだあまり考えてないのでスキップじゃ！

ということでFirebaseを利用したチャットアプリの作成に入る...前に非同期処理のセクションがあるのでJSでの非同期処理について軽くやります。

## 目次

1. [非同期処理とは](#非同期処理とは)
1. [Promiseによる非同期処理](#Promiseによる非同期処理)
1. [async/await](#async/await)
1. [おわりに](#おわりに)

## 非同期処理とは

プログラムを実行するとコードの上から順に1行ずつ処理され、その処理が終わるまで次の行には進まなくなる。これを同期処理という。同期処理に対して非同期処理では処理の終了をまたずに次の行を実行する。

例えば、以下のようなJavaScriptのコードを実行すると上の処理では「1」「2」「3」の順番で表示されるが、`setTimeout`で`console.log(2)`を非同期処理をしているため下の処理では「1」「3」「2」の順で表示される。

```javascript
// 同期処理
console.log(1);
console.log(2);
console.log(3);

// 非同期処理
console.log(1);
setTimeout( () => console.log(2), 1000);
console.log(3);
```

ちなみに1秒(=1000ms)を指定しているが、0秒でも同じ結果になるらしい。少なくともChromeのコンソールだとそうなった。なんでかはわからん。多分このスクリプト自体をコールバックかなんかにして一通り終わってからsetTimeoutの中身を実行してるんかね。(適当)

## Promiseによる非同期処理

非同期処理を行う関数は`setTimeout()`以外にもいろいろあるが、よく使われるものとしてPromiseがある。Promiseでは成功したときに返す`resolve()`メソッド、失敗したことを返す`reject()`メソッドを利用することで処理の終了を伝えることができる。

そして、Promiseオブジェクトは、非同期処理が終了した後行う処理を、`then()`、`catch()`、`finally()`のメソッドで記載することができる。

```typescript
const p = () => new Promise(resolve => {
    setTimeout(() => resolve(2), 1000);
});

// 1, 3, 2と出力される
console.log(1);
p().then(data => console.log(data)); // dataにはresolveされた値の2が入っている
console.log(3);

// 1, 2, 3と表示したい場合はコールバックの中に入れる
console.log(1);
p().then(data => 
    console.log(data);
    console.log(3);
);
```

また、`Promise.all`を利用することで、複数のPromiseを同時に実行させることができる。

```typescript
const p = () => new Promise(resolve => {
    setTimeout(() => resolve(2), 1000);
});

// 1, 2, 2, 3と表示される
console.log(1);
Promise.all([p(), p()]).then(data => {
    console.log(data[0]);
    console.log(data[1]);
    console.log(3);
});
```

ただ、Promiseだと可読性が落ちる…気がする。then句が複数ある場合、コールバック内は大丈夫だけど、別のコールバックに値を持ち越すためには外の変数に退避する必要があるらしい。

## async/await

async/awaitはPromiseを同期処理のように記載することができる演算子らしい。

Promiseのコードとの比較をしてみる。

```typescript
// Promise
log() {
    console.log(1);
    p().then(data => {
        console.log(data);
        console.log(3);
    });
}

// async/await
async log() {
    console.log(1);
    console.log(await p());
    console.log(3);
}
```

コールバックの中に書かなくてよいのでネストが深くならないのはいいね。
同期処理の書き方に近いから結構直感的でよさそう。
ちなみにIEでは使用できません！

## おわりに

なんか今日はインプットに対してアウトプットが貧弱になってしまった感。文章書くの難しいな。まぁ、いいや。明日からチャットアプリ作るぞ。

# アドベントカレンダー

|日付|タイトル|
|-----|------|
|12/02|[アドベントカレンダーやる宣言](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-02)|
|12/03|[Ionic環境構築](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-03)|
|12/04|[Ionicアプリが表示されるまでと最初のサンプルプロジェクト](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-04)|
|12/05|[WordPressと連携してみる](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-05)|
|12/06|[リファクタリングしよう！](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-06)|
|12/07|[~~Capacitorを使ってみる~~JSの非同期処理](https://github.com/yosshi-4989/advent_calender_2019/tree/2019-12-07)|
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


