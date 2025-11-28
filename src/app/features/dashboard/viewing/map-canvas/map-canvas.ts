import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnchorsService, Anchor } from '../../../../services/anchors.service';
import { FullscreenService } from '../../../../services/fullscreen.service';

@Component({
  standalone: true,
  selector: 'app-map-canvas',
  templateUrl: './map-canvas.html',
  styleUrls: ['./map-canvas.scss'],
  imports: [CommonModule]
})
export class MapCanvasComponent implements OnInit {
  
  anchors: Anchor[] = [];
  isFullscreen = false;

constructor(
    private anchorsService: AnchorsService,
    private fullscreenService: FullscreenService
  ) {}

displayWidth = 0;
displayHeight = 0;

@ViewChild('mapImage') mapImage!: ElementRef<HTMLImageElement>;

onImageLoad() {
  const rect = this.mapImage.nativeElement.getBoundingClientRect();
  this.displayWidth = rect.width;
  this.displayHeight = rect.height;

  console.log("IMAGE LOADED:", this.displayWidth, this.displayHeight);
}


ngAfterViewInit(): void {
  setTimeout(() => {
    const rect = this.mapImage.nativeElement.getBoundingClientRect();
    this.displayWidth = rect.width;
    this.displayHeight = rect.height;
  }, 300); // بعد العرض
}

  
ngOnInit() {
  this.anchorsService.getAnchors().subscribe(data => {
    this.anchors = data.map(a => ({
      ...a,
      position: a.position ? (typeof a.position === 'string' ? JSON.parse(a.position) : a.position) : { x: 0, y: 0 }
    }));
  });

  // مراقبة fullscreen لتطبيق class fullscreen
  this.fullscreenService.isFullscreen$.subscribe(state => {
    this.isFullscreen = state;
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
      state ? mapContainer.classList.add('fullscreen') : mapContainer.classList.remove('fullscreen');
    }
  });
}

// دوال لتثبيت الأنكرز على الصورة الأصلية
getScaledX(x: number): number {
  return x * (this.displayWidth / 1280); // 1280 هو العرض الأصلي للصورة
}

getScaledY(y: number): number {
  return y * (this.displayHeight / 720); // 720 هو الطول الأصلي
}
}