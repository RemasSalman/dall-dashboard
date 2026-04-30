import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnchorsService, Anchor } from '../../../../services/anchors.service';

interface AnchorForm {
  qrId: string;
  name: string;
  type: string;
  description: string;
  referenceCorner: string;
  pixels: { x: number; y: number };
  position: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

@Component({
  selector: 'app-anchor-list-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './anchor-list-panel.html',
  styleUrls: ['./anchor-list-panel.scss']
})
export class AnchorListPanelComponent implements OnInit, OnChanges {

  @Input() mapId: string = '';

  anchors: Anchor[] = [];

  isAnchorsListOpen = false;
  isAnchorDetailsOpen = false;

  isDeleteConfirmOpen = false;
  anchorToDelete: Anchor | null = null;

  anchorForm: AnchorForm = {
    qrId: '',
    name: '',
    type: '',
    description: '',
    referenceCorner: '',
    pixels: { x: 0, y: 0 },
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  };

  constructor(private anchorsService: AnchorsService) {}

  // ================= INIT =================

  async ngOnInit(): Promise<void> {

    // ✅ تحميل أولي
    if (this.mapId) {
      await this.loadAnchors();
    }

    // ✅ هذه subscriptions عادية (ما فيها Firestore)
    this.anchorsService.lastClickPos$
      .subscribe(pos => {
        if (!pos) return;

        this.isAnchorDetailsOpen = true;

        this.anchorForm = {
          qrId: '',
          name: '',
          type: '',
          description: '',
          referenceCorner: '',
          pixels: {
            x: pos.pixelX ?? 0,
            y: pos.pixelY ?? 0
          },
          position: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        };
      });

    this.anchorsService.selectedAnchor$
      .subscribe((anchor: Anchor | null) => {
        if (!anchor) return;

        this.isAnchorDetailsOpen = true;

        this.anchorForm = {
          qrId: anchor.qrId ?? '',
          name: anchor.name ?? '',
          type: anchor.type ?? '',
          description: anchor.description ?? '',
          referenceCorner: anchor.referenceCorner ?? '',
          pixels: anchor.pixels ?? { x: 0, y: 0 },
          position: anchor.position ?? { x: 0, y: 0, z: 0 },
          scale: anchor.scale ?? { x: 1, y: 1, z: 1 },
        };
      });
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['mapId'] && this.mapId) {
      await this.loadAnchors();
    }
  }

  // ================= DATA =================

  async loadAnchors(): Promise<void> {
    this.anchors = await this.anchorsService.getAnchorsByMap(this.mapId);
  }

  // ================= FORM =================

  isFormValid(): boolean {
    return !!(
      this.anchorForm.name &&
      this.anchorForm.type &&
      this.anchorForm.name.length <= 50
    );
  }

  async onApply(): Promise<void> {

    if (!this.anchorForm.name || !this.anchorForm.type) {
      alert('Fill all required fields');
      return;
    }

    if (this.anchorForm.name.length > 30) {
      alert('Name cannot exceed 30 characters');
      return;
    }

    const toSave: Anchor = {
      mapId: this.mapId,
      ...this.anchorForm
    };

    await this.anchorsService.addAnchor(toSave);

    // ✅ إعادة تحميل بعد الإضافة
    await this.loadAnchors();

    this.resetForm();
    this.isAnchorDetailsOpen = false;
    this.anchorsService.setLastClickPos(null);
  }

  resetForm() {
    this.anchorForm = {
      qrId: '',
      name: '',
      type: '',
      description: '',
      referenceCorner: '',
      pixels: { x: 0, y: 0 },
      position: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    };
  }

  // ================= UI =================

  openAnchorDetails() {
    this.isAnchorDetailsOpen = true;
  }

  toggleAnchorsList() {
    this.isAnchorsListOpen = !this.isAnchorsListOpen;
  }

  toggleAnchorDetails() {
    this.isAnchorDetailsOpen = !this.isAnchorDetailsOpen;
  }

  onDeleteClick(anchor: Anchor, event?: MouseEvent): void {
    if (event) event.stopPropagation();

    this.anchorToDelete = anchor;
    this.isDeleteConfirmOpen = true;
  }

  cancelDelete(): void {
    this.isDeleteConfirmOpen = false;
    this.anchorToDelete = null;
  }

  async confirmDelete(): Promise<void> {
    if (!this.anchorToDelete?.id) {
      this.cancelDelete();
      return;
    }

    try {
      await this.anchorsService.deleteAnchor(this.anchorToDelete.id);

      // ✅ تحديث القائمة
      this.anchors = this.anchors.filter(a => a.id !== this.anchorToDelete!.id);

      this.cancelDelete();
      this.isAnchorDetailsOpen = false;
    } catch (err) {
      console.error('Error deleting anchor:', err);
      this.cancelDelete();
    }
  }
}