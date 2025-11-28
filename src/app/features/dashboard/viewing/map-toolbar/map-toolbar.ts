import { Component, OnInit } from '@angular/core';
import { FullscreenService } from '../../../../services/fullscreen.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-map-toolbar',
  templateUrl: './map-toolbar.html',
  styleUrls: ['./map-toolbar.scss'],
  imports: [CommonModule]
})
export class MapToolbarComponent implements OnInit {
  isFullscreen = false;

  constructor(private fullscreenService: FullscreenService) {}

 

  toggleFullscreen() {
  this.fullscreenService.setFullscreen(true);
}

 ngOnInit(): void {
  this.fullscreenService.isFullscreen$.subscribe(state => {
    this.isFullscreen = state;
    console.log('Fullscreen state:', state); // للتأكد
  });
}

exitFullscreen() {
  this.fullscreenService.setFullscreen(false);
}
}