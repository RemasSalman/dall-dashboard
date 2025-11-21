import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnchorsService, Anchor } from '../../../../services/anchors.service';

@Component({
  selector: 'app-anchor-list-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './anchor-list-panel.html',
  styleUrls: ['./anchor-list-panel.scss']
})
export class AnchorListPanel implements OnInit {

  isAnchorsListOpen = false;
  isEditedAnchorsOpen = false;
  isAnchorDetailsOpen = false;
  isCustomizationOpen = false;

  anchors: Anchor[] = [];

  anchorForm: Anchor = {
    name: '',
    type: '',
    description: '',
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 }
  };

  constructor(private anchorsService: AnchorsService) {}

  ngOnInit(): void {
    this.anchorsService.getAnchors().subscribe((data) => {
      this.anchors = data;
    });
  }

  onApply() {
    // save to Firestore
    this.anchorsService.addAnchor(this.anchorForm).then(() => {
      // reset form after saving
      this.anchorForm = {
        name: '',
        type: '',
        description: '',
        position: { x: 0, y: 0, z: 0 },
        scale: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 }
      };
    });
  }

  toggleAnchorsList() {
    this.isAnchorsListOpen = !this.isAnchorsListOpen;
  }

  toggleEditedAnchors() {
    this.isEditedAnchorsOpen = !this.isEditedAnchorsOpen;
  }

  toggleAnchorDetails() {
    this.isAnchorDetailsOpen = !this.isAnchorDetailsOpen;
  }

  toggleCustomization() {
    this.isCustomizationOpen = !this.isCustomizationOpen;
  }
}
