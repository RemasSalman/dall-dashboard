import { Injectable } from '@angular/core';
import {
    Firestore,
    collection,
    collectionData,
    query,
    where
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface NavigationSession {
    id?: string;
    mapId: string;
    startAnchorName?: string;
    destinationName?: string;
    durationSeconds?: number;
    status?: string;
    startedAt: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
    constructor(private firestore: Firestore) { }

    getSessions(): Observable<NavigationSession[]> {
        const ref = collection(this.firestore, 'navigationSessions');
        return collectionData(ref, { idField: 'id' }) as Observable<NavigationSession[]>;
    }

    getSessionsByMap(mapId: string): Observable<NavigationSession[]> {
        const ref = collection(this.firestore, 'navigationSessions');
        const q = query(ref, where('mapId', '==', mapId));
        return collectionData(q, { idField: 'id' }) as Observable<NavigationSession[]>;
    }
}