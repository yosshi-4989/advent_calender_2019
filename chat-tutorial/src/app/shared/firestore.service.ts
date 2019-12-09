import { Injectable } from '@angular/core';
import { AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { first } from 'rxjs/operators';

export interface IUser {
  displayName: string;
  photoDataUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  userDoc: AngularFirestoreDocument<IUser>;

  constructor(public af: AngularFirestore) { }

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
