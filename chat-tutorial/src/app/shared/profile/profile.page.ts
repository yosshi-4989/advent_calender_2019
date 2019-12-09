import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Plugins, CameraResultType } from '@capacitor/core';
import { IUser, FirestoreService } from '../firestore.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  uid: string;
  // ユーザー情報
  user: IUser = {
    displayName: null,
    photoDataUrl: null,
  };
  photo: string; // 撮影したデータを格納する

  constructor(
    public modalController: ModalController,
    public auth: AuthService,
    public firestore: FirestoreService,
  ) { }

  ngOnInit() {
  }

  // モーダルを閉じる
  modalDismiss() {
    this.modalController.dismiss();
  }

  // 画像を撮る
  async takePicture() {
    const image = await Plugins.Camera.getPhoto({
      quality: 100, // 画像の最高画質
      resultType: CameraResultType.DataUrl, // 出力形式をBase64文字列に指定
    });
    this.photo = image && image.dataUrl; // 取得結果を格納
  }

  // 画面描画時にuidとuserを初期化する
  async ionViewWillEnter() {
    this.uid = this.auth.getUserId();
    const user = await this.firestore.userInit(this.uid);
    if (user) {
      this.user = user;
    }
  }

  // ユーザー情報を更新してモーダルを閉じる
  async updateProfile() {
    // 画像が更新されていたら保存する
    if (this.photo) {
      this.user.photoDataUrl = this.photo;
    }
    // ユーザー情報の更新
    await this.firestore.userSet(this.user);
    // モーダルを閉じる
    this.modalController.dismiss();
  }
}
