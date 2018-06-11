import { Component, ViewChild } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Config, Nav, Platform, MenuController, ModalController } from 'ionic-angular';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { Diagnostic } from '@ionic-native/diagnostic';

import { FirstRunPage, MainPage, LoginPage } from '../pages/pages';
import { AuthService, LoadingService, SettingsService } from '../providers/providers';
import { Observable } from 'rxjs';
export const LANG_ES: string = 'es';
export const LANG_AR: string = 'ar';

@Component({
  template: `<ion-menu [content]="content">
    <ion-header no-border>
      <ion-toolbar>
        <ion-title>Menu</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <button menuClose ion-item *ngFor="let p of pages" (click)="openPage(p)">
          {{p.title}}
        </button>
      </ion-list>
      <ion-item (click)="logout()" *ngIf="auth.authenticated">
        <ion-icon name="log-out" item-left></ion-icon>
        Log out
      </ion-item>
    </ion-content>

  </ion-menu>
  <ion-nav #content [root]="rootPage"></ion-nav>`
})
export class MyApp {

  rootPage = LoginPage;

  @ViewChild(Nav) nav: Nav;

  pages: any[] = [
    { title: 'Login', component: 'LoginPage' },
    { title: 'Tutorial', component: 'TutorialPage' },
    { title: 'Tabs', component: 'TabsPage' },
    { title: 'Cards', component: 'CardsPage' },
    { title: 'Content', component: 'ContentPage' },
    { title: 'Signup', component: 'SignupPage' },
    { title: 'Master Detail', component: 'ListMasterPage' },
    { title: 'Menu', component: 'MenuPage' },
    { title: 'Settings', component: 'SettingsPage' },
    { title: 'Search', component: 'SearchPage' },
  ];
  PERMISSION = {
    WRITE_EXTERNAL: this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
    READ_EXTERNAL: this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
    CAMERA: this.androidPermissions.PERMISSION.CAMERA,
  };
  private menu: MenuController;

  constructor(
    public platform: Platform,
    public auth: AuthService,
    public modalCtrl: ModalController,
    private loadingService: LoadingService,
    private settingsService: SettingsService,
    private translate: TranslateService,
    private config: Config,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private menuController: MenuController,
    private androidPermissions: AndroidPermissions,
    private diagnostic: Diagnostic
  ) {
    /** TODO */
    this.translate.setDefaultLang(LANG_AR);
    this.platform.setDir('rtl', true);
    this.menu = menuController;
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      if (this.platform.is('android')) {
        this.requestAllPermissions();
      }
      this.initTranslate();
      this.initLoginUser();
    });
  }


  initTranslate() {
    // Set the default language for translation strings, and the current language.
    this.settingsService.getValue('optionLang').then((lang) => {
      if (lang === LANG_AR) this.translate.setDefaultLang(LANG_AR);
    });

    this.translate.get(['BACK_BUTTON_TEXT']).subscribe(values => {
      this.config.set('ios', 'backButtonText', values.BACK_BUTTON_TEXT);
    });
    /**
     *
     */
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      console.log("onLangChange", event.translations)
      if (event.lang === LANG_AR) {
        this.settingsService.setValue('optionLang', LANG_AR);
        this.platform.setDir('rtl', true);
        this.platform.setDir('ltr', false);
      } else {
        this.settingsService.setValue('optionLang', LANG_ES);
        this.platform.setDir('ltr', true);
        this.platform.setDir('rtl', false);
      }
    })
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  logout() {
    this.menu.close();
    this.auth.signOut();
    this.nav.setRoot(LoginPage);
  }

  private requestAllPermissions() {
    const permissions = Object.keys(this.PERMISSION).map(k => this.PERMISSION[k]);
    this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.CAMERA, this.androidPermissions.PERMISSION.GET_ACCOUNTS]).then((status) => {
      // alert(JSON.stringify(status));
    }, error => {
      console.error('permission error:', error);
    });
  }

  private initLoginUser() {

    this.loadingService.showLoading();
    const source = Observable.zip(
      this.settingsService.getValue('initialRun'),
      this.auth.afAuth.authState,
    )
    source.subscribe(
      (res) => {
        console.log(res);
        if (res[0]) {
          if (res[1]) {
            this.settingsService.setValue('uuid', res[1].uid);
            this.rootPage = MainPage;
          } else {
            this.rootPage = LoginPage;
          }
          this.loadingService.hideLoading();
        } else {
          // this.selectLanguage();
          this.loadingService.hideLoading();
        }
      });
  }

  private selectLanguage() {
    const addModal = this.modalCtrl.create(FirstRunPage);
    addModal.present();
  }
}
