import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadingController } from '@ionic/angular';

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
    public http: HttpClient,
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
    this.http.get('https://public-api.wordpress.com/rest/v1.1/sites/ionicjp.wordpress.com/posts/')
      .subscribe(data => {
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
