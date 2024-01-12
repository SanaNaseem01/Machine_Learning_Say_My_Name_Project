import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  Input
} from '@angular/core';
import { Subject, Subscription, fromEvent, map, merge, tap } from 'rxjs';
import { SpeechService } from '../services/speech.service';

@Component({
  selector: 'app-speech-text',
  template: `
    <ng-container>
      <textarea
        name="text"
        [(ngModel)]="msg"
        (change)="textChanged$.next()"
      ></textarea>
      <button id="stop" #stop>Stop!</button>
      <button id="speak" #speak>
      <img src="./assets/images/speak.png" alt="speak"/>
      </button>
    </ng-container>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      button,
      textarea {
        // width: 8%;
        // display: block;
        // margin: 0 309px;
        // padding: 10px;
        cursor: pointer;
        border: 0;
        background: transparent;
        outline: 0;
      }

      textarea {
        height: 5rem;
        display: none;
      }

      img {
        width: 25px;
        cursor: pointer;
      }

      button:active {
        top: 2px;
      }

      button:nth-of-type(1) {
        margin-right: 2%;
      }
      #stop{
        display: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeechTextComponent implements OnInit, OnDestroy {
  @ViewChild('stop', { static: true, read: ElementRef })
  btnStop!: ElementRef<HTMLButtonElement>;

  @ViewChild('speak', { static: true, read: ElementRef })
  btnSpeak!: ElementRef<HTMLButtonElement>;
  @Input({ required: true }) phoneticName!: string;
  textChanged$ = new Subject<void>();
  subscription = new Subscription();
  msg = '';

  constructor(private speechService: SpeechService) { }

  ngOnInit(): void {
    this.msg = this.phoneticName;
    //this.speechService.updateSpeech({ name: 'text', value: this.msg });

    const btnStop$ = fromEvent(this.btnStop.nativeElement, 'click').pipe(
      map(() => false)
    );
    const btnSpeak$ = fromEvent(this.btnSpeak.nativeElement, 'click').pipe(
      map(() => true)
    );
    this.subscription.add(
      merge(btnStop$, btnSpeak$)
        .pipe(tap(() => this.speechService.updateSpeech({ name: 'text', value: this.msg })))
        .subscribe((startOver) => this.speechService.toggle(startOver)),
    );

    this.subscription.add(
      this.textChanged$.pipe(tap(() => this.speechService.updateSpeech({ name: 'text', value: this.msg }))).subscribe(),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
