
import { Component, OnInit, OnChanges, SimpleChanges, AfterViewInit, ElementRef, ViewChild, HostListener, Input } from '@angular/core';
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
export class MapCanvasComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() mapId: string = ''; 
  @Input() imageUrl: string = '';

  anchors: Anchor[] = [];
  isFullscreen = false;
  displayWidth = 0;
  displayHeight = 0;
  previewPos: { x: number; y: number } | null = null;

  @ViewChild('mapImage') mapImage!: ElementRef<HTMLImageElement>;

  constructor(
    private anchorsService: AnchorsService,
    private fullscreenService: FullscreenService
  ) {}

  ngOnInit(): void {
    this.fullscreenService.isFullscreen$.subscribe(state => {
      this.isFullscreen = state;
      setTimeout(() => this.updateMapSize(), 100);
    });
    this.anchorsService.lastClickPos$.subscribe(pos => this.previewPos = pos);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mapId'] && this.mapId) {
      this.loadAnchorsForCurrentMap();
    }
  }

  loadAnchorsForCurrentMap() {
    this.anchorsService.getAnchorsByMap(this.mapId).subscribe((data: Anchor[]) => {
      this.anchors = data;
    });
  }

  ngAfterViewInit(): void { setTimeout(() => this.updateMapSize(), 300); }
  @HostListener('window:resize') onResize() { this.updateMapSize(); }
  onImageLoad(): void { this.updateMapSize(); }

  private updateMapSize(): void {
    if (!this.mapImage) return;
    const rect = this.mapImage.nativeElement.getBoundingClientRect();
    this.displayWidth = rect.width;
    this.displayHeight = rect.height;
  }

  getScaledX(x: number): number { return x * this.displayWidth; }
  getScaledY(y: number): number { return y * this.displayHeight; }

  onMapClick(event: MouseEvent): void {
    if (!this.mapImage) return;
    const rect = this.mapImage.nativeElement.getBoundingClientRect();
    const x = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    const y = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
    this.anchorsService.setLastClickPos({ x, y });
  }
}