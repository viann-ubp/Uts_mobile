import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { LocalNotifications } from '@capacitor/local-notifications';

type ModeType = 'fokus' | 'deep' | 'istirahat';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit, OnDestroy {

  showWelcome: boolean = true;
  isLeaving: boolean = false;
  currentMode: ModeType = 'fokus';

  totalTime: number = 25 * 60;
  remainingTime: number = 25 * 60;

  endTime: number = 0;
  timer: any = null;
  isRunning: boolean = false;

  // ✅ AUDIO YANG BENAR
  audio: HTMLAudioElement = new Audio('assets/sounds/alarm.mp3');

  quotes: string[] = [
    "Stay focused, be present.",
    "Make every second count.",
    "Your future self will thank you.",
    "Slow progress is still progress.",
    "One task at a time."
  ];
  currentQuote: string = "";

  modeConfig: Record<ModeType, any> = {
    fokus: { duration: 25 * 60, label: 'FOKUS', notification: 'Waktu fokus selesai!' },
    deep: { duration: 50 * 60, label: 'DEEP WORK', notification: 'Sesi Deep selesai!' },
    istirahat: { duration: 5 * 60, label: 'REST', notification: 'Istirahat selesai!' }
  };

  constructor(private alertController: AlertController) {}

  async ngOnInit() {
    this.getRandomQuote();

    try {
      await LocalNotifications.requestPermissions();
    } catch {}

    // 🔥 WELCOME ANIMATION FIX
    setTimeout(() => {
      this.isLeaving = true;

      setTimeout(() => {
        this.showWelcome = false;
      }, 800); 
    }, 1500); 

    this.audio.load();
    this.audio.volume = 1.0;
  }

  ngOnDestroy() {
    this.pauseTimer();
  }

  getRandomQuote() {
    const index = Math.floor(Math.random() * this.quotes.length);
    this.currentQuote = this.quotes[index];
  }

  async setMode(mode: ModeType) {
    if (this.isRunning && this.currentMode !== mode) {
      const alert = await this.alertController.create({
        header: 'Ganti Mode?',
        message: 'Timer sedang berjalan. Lanjut pindah?',
        buttons: [
          { text: 'Batal', role: 'cancel' },
          { text: 'Ya', handler: () => this.executeModeChange(mode) }
        ]
      });
      await alert.present();
    } else {
      this.executeModeChange(mode);
    }
  }

  executeModeChange(mode: ModeType) {
    this.pauseTimer();
    this.getRandomQuote();

    this.currentMode = mode;
    this.totalTime = this.modeConfig[mode].duration;
    this.remainingTime = this.totalTime;
  }

  startTimer() {
    if (this.isRunning) return;

    // 🔥 UNLOCK AUDIO (WAJIB)
    this.audio.play().then(() => {
      this.audio.pause();
      this.audio.currentTime = 0;
    }).catch(() => {});

    this.isRunning = true;

    this.endTime = Date.now() + this.remainingTime * 1000;

    this.timer = setInterval(() => {
      const diff = Math.round((this.endTime - Date.now()) / 1000);

      if (diff > 0) {
        this.remainingTime = diff;
      } else {
        this.remainingTime = 0;
        this.handleComplete();
      }
    }, 1000);
  }

  pauseTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.isRunning = false;

    this.audio.pause();
    this.audio.currentTime = 0;
  }

  resetTimer() {
    this.pauseTimer();
    this.executeModeChange(this.currentMode);
  }

  async handleComplete() {
    this.pauseTimer();

    // 🔔 MAINKAN ALARM
    this.audio.pause();
    this.audio.currentTime = 0;

    this.audio.play().then(() => {
      console.log('Alarm bunyi 🔔');
    }).catch(err => {
      console.log('Gagal bunyi:', err);
    });

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'PomodoroKu',
            body: this.modeConfig[this.currentMode].notification,
            id: Date.now()
          }
        ]
      });
    } catch {}
  }

  getOffset() {
    const progress = this.remainingTime / this.totalTime;
    return 283 * (1 - Math.max(0, Math.min(1, progress)));
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    return `${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  }
}