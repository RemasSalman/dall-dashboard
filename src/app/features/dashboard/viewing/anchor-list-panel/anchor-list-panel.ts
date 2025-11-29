import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnchorsService, Anchor } from '../../../../services/anchors.service';

interface AnchorForm {
  name: string;
  type: string;
  description: string;
  position: { x: number; y: number; z: number };
  scale:    { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}

@Component({
  selector: 'app-anchor-list-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './anchor-list-panel.html',
  styleUrls: ['./anchor-list-panel.scss']
})
export class AnchorListPanelComponent implements OnInit {

  @Input() mapId: string = 'vip-default';

  anchors: Anchor[] = [];

  isAnchorsListOpen = false;
  isEditedAnchorsOpen = false;
  isAnchorDetailsOpen = false;
  isCustomizationOpen = false;

  anchorForm: AnchorForm = {
    name: '',
    type: '',
    description: '',
    position: { x: 0, y: 0, z: 0 },
    scale:    { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: 0, z: 0 }
  };

  constructor(private anchorsService: AnchorsService) {}

  ngOnInit(): void {
    // anchors for this map
    this.anchorsService.getAnchorsByMap(this.mapId)
      .subscribe((data: Anchor[]) => {
        this.anchors = data;
      });

    // 🔹 NEW: listen for clicks on the map
    this.anchorsService.lastClickPos$
      .subscribe(pos => {
        if (!pos) return;

        // open "Anchor Details" and prefill position
        this.isAnchorDetailsOpen = true;

        this.anchorForm = {
          ...this.anchorForm,
          position: { x: pos.x, y: pos.y, z: 0 }
        };
      });
  }

  isFormValid(): boolean {
    const f = this.anchorForm;
    const nonEmpty = (s: string | null | undefined) => (s ?? '').trim().length > 0;

    return (
      nonEmpty(f.name) &&
      nonEmpty(f.type) &&
      nonEmpty(f.description) &&
      f.scale.x > 0 &&
      f.scale.y > 0 &&
      f.scale.z > 0
    );
  }

  onApply(): void {
    if (!this.isFormValid()) {
      alert('Please fill all required fields and make sure scale > 0.');
      return;
    }

    const toSave: Anchor = {
      mapId: this.mapId,
      name: this.anchorForm.name,
      type: this.anchorForm.type,
      description: this.anchorForm.description,
      position: this.anchorForm.position,
      scale: this.anchorForm.scale,
      rotation: this.anchorForm.rotation
    };

    this.anchorsService.addAnchor(toSave)
      .then(() => {
        this.anchorForm = {
          name: '',
          type: '',
          description: '',
          position: { x: 0, y: 0, z: 0 },
          scale:    { x: 1, y: 1, z: 1 },
          rotation: { x: 0, y: 0, z: 0 }
        };
        this.isAnchorDetailsOpen = false;
        this.anchorsService.setLastClickPos(null);
      })
      .catch(err => console.error('Error adding anchor:', err));
  }

  openAnchorDetails(): void {
    this.isAnchorDetailsOpen = true;
    // if opened manually, keep current position or start from 0
  }

  toggleAnchorsList()   { this.isAnchorsListOpen = !this.isAnchorsListOpen; }
  toggleEditedAnchors() { this.isEditedAnchorsOpen = !this.isEditedAnchorsOpen; }
  toggleAnchorDetails() { this.isAnchorDetailsOpen = !this.isAnchorDetailsOpen; }
  toggleCustomization() { this.isCustomizationOpen = !this.isCustomizationOpen; }
}
