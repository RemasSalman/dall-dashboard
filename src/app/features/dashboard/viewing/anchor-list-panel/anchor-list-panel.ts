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
export class AnchorListPanelComponent implements OnInit {


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



isFormValid(): boolean {
  const f = this.anchorForm;

  const nonEmpty = (s: string | null | undefined) => (s ?? '').trim().length > 0;

  return (
    nonEmpty(f.name) &&
    nonEmpty(f.type) &&
    nonEmpty(f.description) &&
    f.position.x !== 0 && f.position.y !== 0 && f.position.z !== 0 &&
    f.scale.x !== 0 && f.scale.y !== 0 && f.scale.z !== 0 &&
    f.rotation.x !== 0 && f.rotation.y !== 0 && f.rotation.z !== 0
  );
}


  onApply() {
    if (!this.isFormValid()) return; 

    this.anchorsService.addAnchor(this.anchorForm).then(() => {
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

  openAnchorDetails() {
  this.isAnchorDetailsOpen = true;

  // تهيئة النموذج إذا تبغين يبدأ فاضي
  this.anchorForm = {
    name: '',
    type: '',
    description: '',
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: 0, z: 0 }
  };
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
