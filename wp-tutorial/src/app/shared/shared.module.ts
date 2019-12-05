import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { WpHeadComponent } from './wp-head/wp-head.component';

@NgModule({
  // 使用コンポーネントの宣言
  declarations: [WpHeadComponent],
  // 他コンポーネントで使用可能にする宣言
  exports: [ WpHeadComponent ],
  imports: [
    IonicModule,
    CommonModule
  ]
})
export class SharedModule { }
