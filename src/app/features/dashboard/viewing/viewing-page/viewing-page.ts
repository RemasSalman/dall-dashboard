import { Component } from '@angular/core';

import { MapToolbar } from '../map-toolbar/map-toolbar';
import { MapCanvasComponent } from '../map-canvas/map-canvas';
import { AnchorListPanel } from '../anchor-list-panel/anchor-list-panel';

@Component({
  selector: 'app-viewing-page',
  standalone: true,
  imports: [
    MapToolbar,
    MapCanvasComponent,
    AnchorListPanel,
  ],
  templateUrl: './viewing-page.html',
  styleUrls: ['./viewing-page.scss']
})
export class ViewingPageComponent { }
