import { Injectable } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Observable, map, of, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  adminState$: Observable<{ user: User; adminDoc: any } | null>;

  constructor(private auth: Auth, private firestore: Firestore) {
    this.adminState$ = authState(this.auth).pipe(
      switchMap(user => {
        if (!user) return of(null);

        const ref = doc(this.firestore, `admins/${user.uid}`);
        return docData(ref).pipe(
          map(adminDoc => ({ user, adminDoc }))
        );
      })
    );
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }
}