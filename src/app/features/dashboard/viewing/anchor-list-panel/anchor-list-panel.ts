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
  
  anchorForm: AnchorForm = {
    name: '', type: '', description: '',
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: 0, z: 0 }
  };

  constructor(private anchorsService: AnchorsService) {}

  ngOnInit(): void {
    this.anchorsService.lastClickPos$.subscribe(pos => {
      if (!pos) return;
      this.isAnchorDetailsOpen = true;
      this.anchorForm = { ...this.anchorForm, position: { x: pos.x, y: pos.y, z: 0 } };
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mapId'] && this.mapId) {
      this.loadAnchors();
    }
  }

  loadAnchors() {
    this.anchorsService.getAnchorsByMap(this.mapId).subscribe(data => this.anchors = data);
  }

  isFormValid(): boolean { return !!(this.anchorForm.name && this.anchorForm.type); }

  onApply(): void {
    if (!this.isFormValid()) { alert('Fill all fields'); return; }
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
}