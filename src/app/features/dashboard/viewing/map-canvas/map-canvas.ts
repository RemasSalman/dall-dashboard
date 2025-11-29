import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  HostListener,
  Input
} from '@angular/core';
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
export class MapCanvasComponent implements OnInit, AfterViewInit {

  // You can still pass these from parent later if you want
  @Input() mapId: string = 'vip-default';   // for now, fixed ID
  @Input() imageUrl: string = '';           // image for this map

  anchors: Anchor[] = [];
  isFullscreen = false;

  displayWidth = 0;
  displayHeight = 0;

  // NEW: preview marker position
  previewPos: { x: number; y: number } | null = null;

  @ViewChild('mapImage') mapImage!: ElementRef<HTMLImageElement>;

  constructor(
    private anchorsService: AnchorsService,
    private fullscreenService: FullscreenService
  ) {}

  // =========================
  // Lifecycle
  // =========================

  ngOnInit(): void {
    // load all anchors so you SEE new ones
    this.anchorsService.getAnchors().subscribe((data: Anchor[]) => {
      this.anchors = data;
      console.log('Loaded anchors:', data);
    });

    this.fullscreenService.isFullscreen$.subscribe(state => {
      this.isFullscreen = state;
      const mapContainer = document.querySelector('.map-container');
      if (mapContainer) {
        state
          ? mapContainer.classList.add('fullscreen')
          : mapContainer.classList.remove('fullscreen');
      }
      setTimeout(() => this.updateMapSize(), 100);
    });

    //  NEW: listen for last clicked position to show preview pin
    this.anchorsService.lastClickPos$.subscribe(pos => {
      this.previewPos = pos;   // null = hide preview, coords = show preview
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateMapSize(), 300);
  }

  // =========================
  // Size handling
  // =========================

  @HostListener('window:resize')
  onResize() {
    this.updateMapSize();
  }

  onImageLoad(): void {
    this.updateMapSize();
    console.log('IMAGE LOADED:', this.displayWidth, this.displayHeight);
  }

  private updateMapSize(): void {
    if (!this.mapImage) return;
    const rect = this.mapImage.nativeElement.getBoundingClientRect();
    this.displayWidth = rect.width;
    this.displayHeight = rect.height;
  }

  // =========================
  // Normalized → pixels
  // =========================

  getScaledX(x: number): number {
    return x * this.displayWidth;
  }

  getScaledY(y: number): number {
    return y * this.displayHeight;
  }

  // =========================
  // Click to select anchor position
  // =========================

  onMapClick(event: MouseEvent): void {
    if (!this.mapImage) return;

    const rect = this.mapImage.nativeElement.getBoundingClientRect();

    // 0–1 normalized coordinates
    const xNorm = (event.clientX - rect.left) / rect.width;
    const yNorm = (event.clientY - rect.top) / rect.height;

    const x = Math.min(Math.max(xNorm, 0), 1);
    const y = Math.min(Math.max(yNorm, 0), 1);

    console.log('Clicked normalized:', x, y);

    // store position in service (panel + preview use it)
    this.anchorsService.setLastClickPos({ x, y });
  }
}
