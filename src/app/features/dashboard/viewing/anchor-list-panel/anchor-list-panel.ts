import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-anchor-list-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './anchor-list-panel.html',
  styleUrls: ['./anchor-list-panel.scss']
})
export class AnchorListPanel {

  isAnchorsListOpen = false;
  isEditedAnchorsOpen = false;
  isAnchorDetailsOpen = false;
  isCustomizationOpen = false;


 
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
