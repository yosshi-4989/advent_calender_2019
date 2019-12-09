import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Plugins, CameraResultType } from '@capacitor/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  uid: string;
  // ユーザー情報
  user = {
    displayName: null,
    photoDataUrl: null,
  };
  photo: string; // 撮影したデータを格納する

  constructor(
    public modalController: ModalController,
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
}
