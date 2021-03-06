import { Component, ViewChild, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, ModalController, PopoverController, AlertController } from 'ionic-angular';

import { ItemsService, LoadingService } from '../../providers/providers';
import { DetailsItem } from '../../models/item.entities';
import { FirstRunPage, PopoverPage } from '../pages';
import { TranslateService } from '@ngx-translate/core';
import { ISubscription } from 'rxjs/Subscription';

@IonicPage()
@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html',
})
export class ItemDetailPage {
  @ViewChild(Slides) slidesChild: Slides;

  slides:any[];
  mySlideOptions = {
    pager:true
  };
  itemDetails: DetailsItem;
  private itemUuid: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private itemsService: ItemsService,
    private loadingService: LoadingService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private alertCtrl: AlertController,
    private translate: TranslateService,
  ) {
    console.log(navParams.get('event'));
    this.itemUuid = navParams.get('uuidItem') || undefined;
  }

  /**
   * The view loaded, let's query our items for the list
   */
  ionViewDidLoad() {
    this.loadingService.showLoading();
    this.itemsService.getItemByUuid(this.itemUuid).subscribe(
      (data) => {
        console.log(data);
        this.itemDetails = data;
        // Delete the first element of the array, it is a thumnail.
        this.itemDetails.imagesItem.shift();
      },
      (error) => {
        console.log(error);
        this.loadingService.hideLoading();
      },
      () => {
        this.loadingService.hideLoading();
      }
    );
  }

  goToSlide() {
    const addModal = this.modalCtrl.create('SlideGalleryPage', { gallery: this.itemDetails.imagesItem });
    addModal.present();
  }


  presentPopover(myEvent) {
    const popover = this.popoverCtrl.create(PopoverPage);
    popover.onWillDismiss((data) => {
      if (data) {
        if (data.event === 'delete') {
          this.showDeleteConfirm()
        }
      }
    });
    popover.present({
      ev: myEvent
    });
  }

  private deleteItem() {
    this.itemsService.deleteItem(this.itemDetails).subscribe(
      () => {
        this.navCtrl.pop({});
      },
      (error) => {
        console.error(error);
      }
    );
  }

  private showDeleteConfirm() {
    const confirm = this.alertCtrl.create({
      title: this.translate.instant('CONFIRM_DELETE_ITEM_TITLE'),
      message: this.translate.instant('CONFIRM_DELETE_ITEM_MESSAGE'),
      buttons: [
        {
          text: this.translate.instant('YES'),
          handler: () => {
            this.deleteItem()
          }
        },
        {
          text: this.translate.instant('NO'),
          handler: () => {
            console.log('Agree clicked');
          }
        }
      ]
    });
    confirm.present();
  }

}
