import { Injectable } from '@angular/core';
import { 
  Firestore, collection, addDoc, deleteDoc, doc, collectionData 
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface MapData {
  id?: string;
  name: string;
  imageUrl: string;
}

@Injectable({ providedIn: 'root' })
export class MapsService {

  constructor(private firestore: Firestore) {}

  getMaps(): Observable<MapData[]> {
    const mapsRef = collection(this.firestore, 'maps');
    return collectionData(mapsRef, { idField: 'id' }) as Observable<MapData[]>;
  }

  async uploadMap(file: File, mapName: string): Promise<void> {
  if (!file.type.startsWith('image/')) {
    throw new Error('The file must be an image only');
  }
    if (file.size > 1048576) { 
      throw new Error('Image is too large! Please choose an image smaller than 1MB.');
    }
    const base64Image = await this.convertFileToBase64(file);
    const mapsCollection = collection(this.firestore, 'maps');
    await addDoc(mapsCollection, {
      name: mapName,
      imageUrl: base64Image
    });
  }

  async deleteMap(mapId: string): Promise<void> {
    const mapDocRef = doc(this.firestore, `maps/${mapId}`);
    await deleteDoc(mapDocRef);
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
}