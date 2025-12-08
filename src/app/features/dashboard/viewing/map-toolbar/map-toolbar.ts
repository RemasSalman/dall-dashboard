import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullscreenService } from '../../../../services/fullscreen.service';
import { MapsService, MapData } from '../../../../services/maps.service'; 

@Component({
  standalone: true,
  selector: 'app-map-toolbar',
  templateUrl: './map-toolbar.html',
  styleUrls: ['./map-toolbar.scss'],
  imports: [CommonModule]
})
export class MapToolbarComponent implements OnInit {
  
  isFullscreen = false;
  maps: MapData[] = [];
  currentMapId: string = '';
  currentMapData: MapData | null = null;

  // Modal Variables
  showModal = false;         // Naming Modal
  showSuccessModal = false;  // Success Modal
  pendingFile: File | null = null;

  @Output() mapSelected = new EventEmitter<MapData | null>();

  constructor(
    private fullscreenService: FullscreenService,
    private mapsService: MapsService
  ) {}

  ngOnInit(): void {
    this.fullscreenService.isFullscreen$.subscribe(state => this.isFullscreen = state);

    this.mapsService.getMaps().subscribe(data => {
      this.maps = data;
      if (this.maps.length > 0 && !this.currentMapId) {
        this.selectMap(this.maps[0]);
      } else if (this.maps.length === 0) {
        this.currentMapId = '';
        this.currentMapData = null;
        this.mapSelected.emit(null);
      }
    });
  }

  onMapChange(event: any) {
    const selectedId = event.target.value;
    const selectedMap = this.maps.find(m => m.id === selectedId);
    if (selectedMap) this.selectMap(selectedMap);
  }

  selectMap(map: MapData) {
    this.currentMapId = map.id!;
    this.currentMapData = map;
    this.mapSelected.emit(map); 
  }

  // 1. File Selection
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.pendingFile = file;
      this.showModal = true; 
      event.target.value = '';
    }
  }

  // 2. Save Action
  async onSaveMap(nameInput: string) {
    if (!nameInput || !this.pendingFile) return;

    try {
      await this.mapsService.uploadMap(this.pendingFile, nameInput);
      
      // Close input modal and open success modal
      this.closeModal(); 
      this.showSuccessModal = true; 

    } catch (error: any) {
      alert(error.message);
    }
  }

  closeModal() {
    this.showModal = false;
    this.pendingFile = null;
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }

  async onDeleteMap() {
    if (!this.currentMapData?.id) return;
    if (confirm(`Delete "${this.currentMapData.name}"?`)) {
      await this.mapsService.deleteMap(this.currentMapData.id);
      this.currentMapId = '';
      this.currentMapData = null;
      this.mapSelected.emit(null);
    }
  }

  toggleFullscreen() { this.fullscreenService.setFullscreen(true); }
  exitFullscreen() { this.fullscreenService.setFullscreen(false); }
}