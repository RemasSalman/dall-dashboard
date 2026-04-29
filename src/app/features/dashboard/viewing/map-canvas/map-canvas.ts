import {
  Component, OnInit, OnChanges, SimpleChanges,
  AfterViewInit, ElementRef, ViewChild,
  HostListener, Input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnchorsService, Anchor } from '../../../../services/anchors.service';
import { FullscreenService } from '../../../../services/fullscreen.service';

// 🔥 Firestore (Batch)
import { Firestore, writeBatch, doc } from '@angular/fire/firestore';

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
  previewPos: any = null;

  @ViewChild('mapImage') mapImage!: ElementRef<HTMLImageElement>;

  constructor(
    private anchorsService: AnchorsService,
    private fullscreenService: FullscreenService,
    private firestore: Firestore // ✅ مهم
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

  // ✅ تحميل بدون حفظ
  loadAnchorsForCurrentMap() {
    this.anchorsService.getAnchorsByMap(this.mapId).subscribe((data: Anchor[]) => {
      this.anchors = this.generateNeighbors(data, 1.5);

      console.table(this.anchors.map(a => ({
        name: a.name,
        neighbors: a.neighbors?.join(', ')
      })));
    });
  }

  // ✅ حساب المسافة
  getDistance(a: Anchor, b: Anchor): number {
    const dx = a.position.x - b.position.x;
    const dy = a.position.y - b.position.y;
    const dz = a.position.z - b.position.z;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  // ✅ توليد neighbors (بدون حفظ)
  generateNeighbors(anchors: Anchor[], threshold: number = 5): Anchor[] {

    anchors.forEach(anchor => anchor.neighbors = []);

    for (let i = 0; i < anchors.length; i++) {
      for (let j = i + 1; j < anchors.length; j++) {

        const a = anchors[i];
        const b = anchors[j];

        const distance = this.getDistance(a, b);

        if (distance < threshold) {
          a.neighbors!.push(b.name);
          b.neighbors!.push(a.name);
        }
      }
    }

    return anchors;
  }

  // 🔥 أهم دالة (Batch + بدون تكرار)
  async saveGeneratedNeighborsToFirestore(): Promise<void> {

    const batch = writeBatch(this.firestore);

    this.anchors.forEach(anchor => {
      if (!anchor.id) return;

      const ref = doc(this.firestore, `anchors/${anchor.id}`);

      batch.update(ref, {
        neighbors: anchor.neighbors || []
      });
    });

    await batch.commit();

    console.log('✅ Saved using batch (1 write instead of many)');
  }

  // ================= UI =================

  ngAfterViewInit(): void {
    setTimeout(() => this.updateMapSize(), 300);
  }

  @HostListener('window:resize')
  onResize() { this.updateMapSize(); }

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

    const target = event.target as HTMLElement;

    if (target.closest('.map-anchor')) return;

    const rect = this.mapImage.nativeElement.getBoundingClientRect();

    const pixelX = event.clientX - rect.left;
    const pixelY = event.clientY - rect.top;

    const x = Math.min(Math.max(pixelX / rect.width, 0), 1);
    const y = Math.min(Math.max(pixelY / rect.height, 0), 1);

    this.anchorsService.setSelectedAnchor(null);
    this.anchorsService.setLastClickPos({
      x, y,
      pixelX: Math.round(pixelX),
      pixelY: Math.round(pixelY)
    });
  }

  onAnchorClick(event: MouseEvent, anchor: Anchor): void {
    event.stopPropagation();

    this.anchorsService.setLastClickPos(null);
    this.anchorsService.setSelectedAnchor(anchor);
  }
}