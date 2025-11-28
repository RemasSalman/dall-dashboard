import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Anchor {
  id?: string;             // Firestore doc ID when reading
  name: string;
  type: string;
  description?: string;

  position: { x: number; y: number; z: number };
  scale:    { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}

@Injectable({
  providedIn: 'root'
})
export class AnchorsService {

  constructor(private firestore: Firestore) {}

  // READ from Firestore
  getAnchors(): Observable<Anchor[]> {
    const anchorsRef = collection(this.firestore, 'anchors');
    return collectionData(anchorsRef, { idField: 'id' }) as Observable<Anchor[]>;
  }

  // WRITE to Firestore
  addAnchor(anchor: Anchor) {
    const anchorsRef = collection(this.firestore, 'anchors');
    return addDoc(anchorsRef, anchor);
  }




  

}
