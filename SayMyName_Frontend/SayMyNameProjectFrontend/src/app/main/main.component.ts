import { Component } from '@angular/core';
import { BehaviorSubject, Observable, Subject, interval, take } from "rxjs";
declare var $: any;
import * as RecordRTC from 'recordrtc';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})

export class MainComponent {
  title = 'micRecorder';
  //Lets declare Record OBJ
  public record: any;
  //URL of Blob
  public url: any;
  public error: any;
  public serverData: JSON | undefined;
  public employeeData: JSON | undefined;
  public mock: any | undefined;
  public studentDetails: any | undefined;
  public username: any | undefined;
  public studentID: number = 0;
  public start_recording: boolean = false;
  public hide_default_recording_icon: boolean = true;
  public obs$ = interval(1000);
  public time_interval: number = 0;
  public limited$ = this.obs$.pipe(take(11));
  public disable_re_record: boolean = true;
  public display_content_card: boolean = false;
  public name_in_phonetics: string | undefined;
  public phoneticName: string | undefined;
  public soundsCorrectFlag: boolean = false;
  public displayGreatCapturedFlag: boolean = false;
  public tempMsg:boolean = false;
  public soundsWrongFlag: boolean = false;

  constructor(private domSanitizer: DomSanitizer,
    private toastr: ToastrService,
    private httpClient: HttpClient,
    private ngxService: NgxUiLoaderService,
  ) { }

  ngOnInit(): void {
  }

  // this method handles the user action from the user interface
  public handleUserAction = (type: string, event: any) => {
    switch (type) {
      case 'search': {
        this.display_content_card = false;
        if (this.studentDetails != undefined) {
          this.studentID = (this.studentDetails?.split(':'))[0]
          this.username = (this.studentDetails?.split(':'))[1] //return an array, taking the second element
          if (this.studentID != -1 && this.username != '') {
            if (/^\d+$/.test(this.studentID?.toString())) {
              if (/^[A-Za-z]*$/.test(this.username)) {
                this.display_content_card = true;
                this.soundsCorrectFlag = false;
                let studentDetail = {
                  studentId: this.studentID,
                  studentName: this.username
                }
                this.getPhonetics(studentDetail)
                this.displayGreatCapturedFlag = false;
                this.tempMsg = false;
              }
              else {
                this.displayMessage('The student name should be in letters only.', 'ERROR')
              }

            }
            else {
              this.displayMessage('The student ID should be in number only.', 'ERROR')
            }
          }
          else {
            this.displayMessage('Please enter the student ID and user name.', 'ERROR')
          }
        }
        else {
          this.displayMessage('Please enter the student ID and user name.', 'ERROR')
        }
        break;
      }
      case 'start_recording': {
        this.hide_default_recording_icon = false;
        this.start_recording = true;
        this.disable_re_record = true;
        this.initiateRecording()
        break;
      }
      case 'stop_recording': {
        this.disable_re_record = false;
        this.displayMessage('Recording captured successfully.', 'SUCCESS')
        this.stopRecording()
        break;
      }
      case 're-record': {
        this.url = null;
        this.disable_re_record = true;
        this.initiateRecording();
        break;
      }
      case 'phonetics-correct': {
        this.displayGreatCapturedFlag = true;
        this.tempMsg = false;
        let reqObj = {
          studentId: this.studentID,
          studentName: this.username,
          feedback: 1
        }
        this.giveUserFeedback(reqObj)
        // for future functionality - audio recorded by user
        // this.soundsWrongFlag = false;
        break;
      }
      case 'phonetics-wrong': {
        // for future functionality - audio recorded by user
        // this.soundsWrongFlag = true;
        let reqObj = {
          studentId: this.studentID,
          studentName: this.username,
          feedback: 0
        }
        this.giveUserFeedback(reqObj)
        this.displayGreatCapturedFlag = false;
        this.tempMsg = true;
        break;
      }
      default: {
        break;
      }
    }
  }

  // global function to show toaster message
  private displayMessage = (message: string, state: string) => {
    switch (state.toLowerCase()) {
      case 'error':
        this.toastr.error(message, state, {
          closeButton: true,
          progressBar: true
        });
        break;
      case 'info':
        this.toastr.info(message, state, {
          closeButton: true,
          progressBar: true
        });
        break;
      case 'success':
        this.toastr.success(message, state, {
          closeButton: true,
          progressBar: true
        });
        break;
      default:
        break;
    }

  }

  // initiats the recording to record the user's voice
  private initiateRecording() {
    let mediaConstraints = {
      video: false,
      audio: true
    };
    navigator.mediaDevices.getUserMedia(mediaConstraints).then(this.successCallback.bind(this), this.errorCallback.bind(this));
  };

  public sanitize(url: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  };

  private successCallback(stream: any) {
    //Start Actual Recording
    var StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
    this.record = new StereoAudioRecorder(stream, {
      mimeType: 'audio/wav',
    });
    this.record.record();
    this.displayMessage('Please start speaking.', 'INFO')
  };


  private stopRecording() {
    this.record.stop(this.processRecording.bind(this));
  };
  /**
  * processRecording Do what ever you want with blob
  * @param  {any} blob Blog
  */
  private processRecording(blob: any) {
    this.url = URL.createObjectURL(blob);
    console.log("blob", blob);
    console.log("url", this.url);
  };

  private errorCallback(error: any) {
    this.error = 'Can not play audio in your browser';
  };

  // calling the service from the backend to get the required phonetics.
  private getPhonetics = (reqObj: any) => {
    this.phoneticName = undefined;
    this.ngxService.start();
    this.httpClient.post('http://127.0.0.1:5002/getPhonetics', reqObj).subscribe(data => {
      let requestedData: any = data
      if (requestedData?.status === "success") {
        this.ngxService.stop();
        this.phoneticName = requestedData?.phoneticsSpelling
        this.soundsCorrectFlag = true;
        this.displayMessage('Successful API response.', 'SUCCESS')
      }
      else {
        this.displayMessage(requestedData?.message, 'ERROR')
        this.ngxService.stop();
      }
    })
  }

  private giveUserFeedback = (reqObj: any) => {
    this.ngxService.start();
    this.httpClient.post('http://127.0.0.1:5002/userFeedback',reqObj).subscribe(data => {
      let requestedData: any = data
      if (requestedData?.status === "success") {
        this.ngxService.stop();
        this.displayMessage('Successful API response.', 'SUCCESS')
      }
      else {
        this.displayMessage('Could not process the request', 'ERROR')
        this.ngxService.stop();
      }
    })
  }
}
