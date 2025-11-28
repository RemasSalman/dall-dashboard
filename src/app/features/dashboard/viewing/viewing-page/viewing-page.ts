import { Component } from '@angular/core';

import { MapToolbarComponent } from '../map-toolbar/map-toolbar';
import { AnchorListPanelComponent  } from '../anchor-list-panel/anchor-list-panel';
import { MapCanvasComponent } from '../map-canvas/map-canvas';

@Component({
  selector: 'app-viewing-page',
  standalone: true,
  imports: [
    MapToolbarComponent,
    AnchorListPanelComponent ,
        MapCanvasComponent
  ],
  templateUrl: './viewing-page.html',
  styleUrls: ['./viewing-page.scss']
})
export class ViewingPageComponent { }
