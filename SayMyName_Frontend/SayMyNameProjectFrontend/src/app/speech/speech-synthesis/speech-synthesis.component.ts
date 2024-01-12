import { ChangeDetectionStrategy, Input,Component } from '@angular/core';

@Component({
  selector: 'app-speech-synthesis',
  template: ` <div class="">
    <app-speech-voice></app-speech-voice>
    <app-speech-text [phoneticName]="phoneticName"></app-speech-text>
  </div>`,
  styles: [
    `
      

      .voiceinator {
        padding: 2rem;
        width: 44rem;
        border-radius: 1rem;
        position: relative;
        background: white;
        overflow: hidden;
        z-index: 1;
        box-shadow: 0 0 5px 5px rgba(0, 0, 0, 0.1);
      }

      h1 {
        width: calc(100% + 4rem);
        margin: -2rem 0 2rem -2rem;
        padding: 0.5rem;
        background: #ffc600;
        border-bottom: 5px solid #f3c010;
        text-align: center;
        font-size: 5rem;
        font-weight: 100;
        font-family: 'Pacifico', cursive;
        text-shadow: 3px 3px 0 #f3c010;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeechSynthesisComponent {
  @Input({ required: true }) phoneticName!: string;
}
