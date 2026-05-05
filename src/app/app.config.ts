import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';

import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    provideFirebaseApp(() => initializeApp(environment.firebase)),

    //  CONNECT FIRESTORE TO EMULATOR
    provideFirestore(() => {
      const firestore = getFirestore();
      connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
      return firestore;
    }),

    // CONNECT AUTH TO EMULATOR
    provideAuth(() => {
      const auth = getAuth();
      connectAuthEmulator(auth, 'http://127.0.0.1:9099');
      return auth;
    })
  ]
};