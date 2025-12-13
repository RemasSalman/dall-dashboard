import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnchorsService, Anchor } from '../../../../services/anchors.service';

interface AnchorForm {
  name: string; type: string; description: string;
  position: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
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
    name: '', type: '', description: '',
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: 0, z: 0 }
  };

  constructor(private anchorsService: AnchorsService) {}

  ngOnInit(): void {
    this.anchorsService.getAnchorsByMap(this.mapId)
      .subscribe((data: Anchor[]) => {
        this.anchors = data;
      });

    this.anchorsService.lastClickPos$
      .subscribe(pos => {
        if (!pos) return;

        this.isAnchorDetailsOpen = true;

        this.anchorForm = {
          name: '',
          type: '',
          description: '',
          position: { x: pos.x, y: pos.y, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          rotation: { x: 0, y: 0, z: 0 }
        };
      });

    this.anchorsService.selectedAnchor$
      .subscribe((anchor: Anchor | null) => {
        if (!anchor) return;

        this.isAnchorDetailsOpen = true;

        this.anchorForm = {
          name:        anchor.name ?? '',
          type:        anchor.type ?? '',
          description: anchor.description ?? '',
          position:    anchor.position ?? { x: 0, y: 0, z: 0 },
          scale:       anchor.scale ?? { x: 1, y: 1, z: 1 },
          rotation:    anchor.rotation ?? { x: 0, y: 0, z: 0 }
        };
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mapId'] && this.mapId) {
      this.loadAnchors();
    }
  }

  loadAnchors() {
    this.anchorsService.getAnchorsByMap(this.mapId)
      .subscribe(data => this.anchors = data);
  }

  isFormValid(): boolean {
    return !!(
      this.anchorForm.name &&
      this.anchorForm.type &&
      this.anchorForm.name.length <= 50

    );
  }

  onApply(): void {
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

    this.anchorsService.addAnchor(toSave).then(() => {
      this.resetForm();
      this.isAnchorDetailsOpen = false;
      this.anchorsService.setLastClickPos(null);
    });
  }

  resetForm() {
    this.anchorForm = {
      name: '', type: '', description: '',
      position: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      rotation: { x: 0, y: 0, z: 0 }
    };
  }

  openAnchorDetails() { this.isAnchorDetailsOpen = true; }
  toggleAnchorsList() { this.isAnchorsListOpen = !this.isAnchorsListOpen; }
  toggleAnchorDetails() { this.isAnchorDetailsOpen = !this.isAnchorDetailsOpen; }

  onDeleteClick(anchor: Anchor, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation(); 
    }
    this.anchorToDelete = anchor;
    this.isDeleteConfirmOpen = true;
  }

  cancelDelete(): void {
    this.isDeleteConfirmOpen = false;
    this.anchorToDelete = null;
  }

  confirmDelete(): void {
    if (!this.anchorToDelete || !this.anchorToDelete.id) {
      this.cancelDelete();
      return;
    }

    this.anchorsService.deleteAnchor(this.anchorToDelete.id)
      .then(() => {
        this.anchors = this.anchors.filter(a => a.id !== this.anchorToDelete!.id);
        this.cancelDelete();
        this.isAnchorDetailsOpen = false;
      })
      .catch(err => {
        console.error('Error deleting anchor:', err);
        this.cancelDelete();
      });
  }
}
