import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-map-canvas',
  templateUrl: './map-canvas.html',
  styleUrls: ['./map-canvas.scss']
})
export class MapCanvasComponent {

  anchors = [
    { name: 'HR Office 01', x: 30, y: 40 },
    { name: 'Meeting Room 01', x: 60, y: 50 }
  ];

}
