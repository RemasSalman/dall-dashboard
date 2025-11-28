import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FullscreenService {
  private _isFullscreen = new BehaviorSubject<boolean>(false);
  isFullscreen$ = this._isFullscreen.asObservable();

  setFullscreen(state: boolean) {
    this._isFullscreen.next(state);
  }

  toggle() {
    this._isFullscreen.next(!this._isFullscreen.value);
  }
}
