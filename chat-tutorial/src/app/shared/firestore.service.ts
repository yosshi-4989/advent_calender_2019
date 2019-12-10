import { Injectable } from '@angular/core';
import { AngularFirestoreDocument, AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { first, concatMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface IUser {
  displayName: string;
  photoDataUrl: string;
}

// メッセージ情報を格納する型
export interface IMessage {
  uid: string;
  message: string;
  timestamp: number;
}
// ユーザー、メッセージの両方の要素を持つクラス型
export interface IChat extends IUser, IMessage {}

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  userDoc: AngularFirestoreDocument<IUser>;
  messageCollection: AngularFirestoreCollection<IMessage>;
  userCollection: AngularFirestoreCollection<IUser>;

  constructor(public af: AngularFirestore) {
    // メッセージのコレクションを時刻順に取得
    this.messageCollection = this.af.collection<IMessage>('chat', ref => ref.orderBy('timestamp', 'desc'));
    // ユーザのコレクションを取得
    this.userCollection = this.af.collection<IUser>('users');
  }

  // メッセージのコレクションにメッセージを追加
  messageAdd(message: IMessage) {
    return this.messageCollection.add(message);
  }

  // メッセージのコレクションから表示するIChat[]を生成する
  // PromiseではなくRxJSのObservable型で利用していることでメッセージのコレクションが更新されるとデータ取得が走る(ストリームが流れる、というらしい)
  chatInit(): Observable<IChat[]> {
    // メッセージコレクションのvalueを取得(DocumentのidをmessageIdとして追加)
    return this.messageCollection.valueChanges( {idField: 'messageId'} )
      // コレクションのメッセージ順に処理する
      .pipe(concatMap(async messages => {
        // ユーザーコレクションのvalueを取得(Documentのidをuidとして追加)
        const users = await this.userCollection.valueChanges( {idField: 'uid'} )
          .pipe(first()).toPromise(Promise);
        // IMessage[]からIChat[]を生成して返却
        return messages.map(message => {
          // messageのuidと一致するuserを取得
          const user = users.find(u => u.uid === message.uid);
          // message(IMessage型)にuser(IUser型)の要素を追加してIChat型のオブジェクトを生成
          return Object.assign(message, user);
        });
      }));
  }

  // ユーザー情報(userDoc)を初期化するメソッド
  userInit(uid: string): Promise<IUser> {
    // users/[uid]/[IUser型データ] の形で保存する
    this.userDoc = this.af.doc<IUser>('users/' + uid);
    return this.userDoc.valueChanges()
      .pipe(first())
      .toPromise(Promise);
  }

  // ユーザー情報を更新する
  userSet(user: IUser): Promise<void> {
    return this.userDoc.set(user);
  }
}
