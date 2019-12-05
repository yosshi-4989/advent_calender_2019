import { Component } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { WordpressService } from '../wordpress.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  posts: {
    ID: number;
    title: string;
    content: string;
    date: string;
  }[] = [];

  constructor(
    public wordpress: WordpressService,
    public loadingController: LoadingController,
  ) {}

  async ionViewDidEnter() {
    // ローディング画面の作成
    const loading = await this.loadingController.create({
      message: 'Loading...',
    });
    if (!this.posts.length) {
      // データが存在しない場合、読み込み完了までローディングを表示
      await loading.present();
    }
    this.wordpress.getPosts().subscribe(data => {
        this.posts = data['posts'];
        // ローディング画面の非表示
        loading.dismiss();
      });
  }

  // trackByに渡す関数
  // *ngForでtrackByにメソッドを指定すると、postsの変更で再描画する際に
  // 返却する値を参照して値の修正が入るようになる？
  trackByFn(index, item): number {
    return item.ID;
  }
}
