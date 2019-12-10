import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, IonContent } from '@ionic/angular';
import { ProfilePage } from '../shared/profile/profile.page';
import { AuthService } from '../auth/auth.service';
import { FirestoreService, IUser, IChat } from '../shared/firestore.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  message = '';
  uid: string;
  user: IUser;
  chat: Observable<IChat[]>;

  // contentプロパティを<ion-content>に紐づける
  @ViewChild(IonContent, { static: true})
  content: IonContent;
  constructor(
    public modalController: ModalController,
    public auth: AuthService,
    public firestore: FirestoreService,
  ) {}

  async ngOnInit() {
    // authからuidを取得し、firestoreのデータを確認
    const user = await this.firestore.userInit( this.auth.getUserId() );
    if (!user) {
      // modalを作成
      const modal = await this.modalController.create({
        component: ProfilePage,
      });
      // modalを表示
      await modal.present();
      // モーダルが非表示になった時にも表示するメソッドを実行してユーザー情報を取得する
      modal.onWillDismiss().then(() => this.ionViewWillEnter());
    }
    // chatを初期化
    this.chat = this.firestore.chatInit();
  }

  // ユーザ情報を取得
  async ionViewWillEnter() {
    this.uid = this.auth.getUserId();
    this.user = await this.firestore.userInit(this.uid);
  }

  // メッセージの送信
  postMessage() {
    // ユーザー情報がない場合ははじく
    if (!this.user) {
      alert('プロフィール登録が必要です');
      return;
    }
    // メッセージの送信
    this.firestore.messageAdd({
      uid: this.uid,
      message: this.message,
      timestamp: Date.now(),
    });
    // 入力の初期化
    this.message = '';
    // 100msかけて一番上までスクロールする
    this.content.scrollToTop(100);
  }

  // チャットが更新されたときに全部再描画されないようにmessageIdで区別する
  trackByFn(index, item) {
    return item.messageId;
  }
}
