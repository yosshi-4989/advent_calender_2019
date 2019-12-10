import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ProfilePage } from '../shared/profile/profile.page';
import { AuthService } from '../auth/auth.service';
import { FirestoreService } from '../shared/firestore.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  message = '';
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
    }
  }

}
