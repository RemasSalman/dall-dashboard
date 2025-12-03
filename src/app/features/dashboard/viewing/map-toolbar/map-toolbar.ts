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

  @Output() mapSelected = new EventEmitter<MapData | null>();

  constructor(
    private fullscreenService: FullscreenService,
    private mapsService: MapsService
  ) {}

  ngOnInit(): void {
    this.fullscreenService.isFullscreen$.subscribe(state => this.isFullscreen = state);

    this.mapsService.getMaps().subscribe(data => {
      this.maps = data;
      // اختيار أول خريطة تلقائياً
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

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const mapName = prompt('Enter map name:', file.name.split('.')[0]);
      if (mapName) {
        try {
          await this.mapsService.uploadMap(file, mapName);
          alert('Map saved!');
        } catch (error: any) {
          alert(error.message);
        }
      }
    }
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