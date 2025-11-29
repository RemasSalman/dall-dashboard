// anchors.service.ts
import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  query,
  where
} from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';   // add BehaviorSubject

export interface Anchor {
  id?: string;
  mapId: string;
  name: string;
  type: string;
  description?: string;

  position: { x: number; y: number; z: number };
  scale:    { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}

@Injectable({ providedIn: 'root' })
export class AnchorsService {

  // NEW: last click position shared between map + panel
  private lastClickPosSubject =
    new BehaviorSubject<{ x: number; y: number } | null>(null);

  lastClickPos$ = this.lastClickPosSubject.asObservable();

  setLastClickPos(pos: { x: number; y: number } | null) {
    this.lastClickPosSubject.next(pos);
  }

  constructor(private firestore: Firestore) {}

  getAnchors(): Observable<Anchor[]> {
    const anchorsRef = collection(this.firestore, 'anchors');
    return collectionData(anchorsRef, { idField: 'id' }) as Observable<Anchor[]>;
  }

  getAnchorsByMap(mapId: string): Observable<Anchor[]> {
    const anchorsRef = collection(this.firestore, 'anchors');
    const q = query(anchorsRef, where('mapId', '==', mapId));
    return collectionData(q, { idField: 'id' }) as Observable<Anchor[]>;
  }

  addAnchor(anchor: Anchor) {
    const anchorsRef = collection(this.firestore, 'anchors');
    return addDoc(anchorsRef, anchor);
  }
}
