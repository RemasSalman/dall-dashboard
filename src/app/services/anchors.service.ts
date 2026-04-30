// anchors.service.ts

import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  doc,
  deleteDoc,
  updateDoc,
  getDocs
} from '@angular/fire/firestore';

import { BehaviorSubject } from 'rxjs';

export interface Anchor {
  qrId: string;
  id?: string;
  mapId: string;
  name: string;
  type: string;
  description?: string;
  referenceCorner?: string;
  pixels?: { x: number; y: number };
  position: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  neighbors?: string[];
}

@Injectable({ providedIn: 'root' })
export class AnchorsService {

  constructor(private firestore: Firestore) {}

  // =========================
  // 🔵 Shared UI State
  // =========================

  private lastClickPosSubject =
    new BehaviorSubject<{
      x: number;
      y: number;
      pixelX?: number;
      pixelY?: number;
    } | null>(null);

  lastClickPos$ = this.lastClickPosSubject.asObservable();

  setLastClickPos(pos: {
    x: number;
    y: number;
    pixelX?: number;
    pixelY?: number;
  } | null) {
    this.lastClickPosSubject.next(pos);
  }

  private selectedAnchorSubject =
    new BehaviorSubject<Anchor | null>(null);

  selectedAnchor$ = this.selectedAnchorSubject.asObservable();

  setSelectedAnchor(anchor: Anchor | null) {
    this.selectedAnchorSubject.next(anchor);
  }

  // =========================
  // 🟢 Firestore (SAFE)
  // =========================

  // ✅ جلب مرة واحدة فقط (بدون realtime)
  async getAnchorsByMap(mapId: string): Promise<Anchor[]> {
    const anchorsRef = collection(this.firestore, 'anchors');
    const q = query(anchorsRef, where('mapId', '==', mapId));

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Anchor[];
  }

  // ✅ إضافة
  async addAnchor(anchor: Anchor) {
    const anchorsRef = collection(this.firestore, 'anchors');
    return await addDoc(anchorsRef, anchor);
  }

  // ✅ حذف
  async deleteAnchor(anchorId: string): Promise<void> {
    const ref = doc(this.firestore, 'anchors', anchorId);
    return await deleteDoc(ref);
  }

  // ✅ تحديث (مع حماية)
  async updateAnchor(anchorId: string, data: Partial<Anchor>): Promise<void> {
    const ref = doc(this.firestore, 'anchors', anchorId);
    return await updateDoc(ref, data);
  }
}