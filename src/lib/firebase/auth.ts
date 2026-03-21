import {
  getFirebaseAuth,
  getFirebaseDb,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  signInWithPopup,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
} from './config';
import type { User as FirebaseUser } from 'firebase/auth';
import type { User } from '@/lib/types';

const googleProvider = new GoogleAuthProvider();

/** Set the __session cookie so proxy.ts can gate protected routes server-side. */
async function setSessionCookie(firebaseUser: FirebaseUser): Promise<void> {
  const token = await firebaseUser.getIdToken();
  document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Lax`;
}

/** Clear the __session cookie on sign-out. */
function clearSessionCookie(): void {
  document.cookie = '__session=; path=/; max-age=0';
}

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(getFirebaseAuth(), googleProvider);
  await setSessionCookie(result.user);
  const user = await getOrCreateUser(result.user);
  return user;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const auth = getFirebaseAuth();
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  await setSessionCookie(result.user);
  const user = await getOrCreateUser(result.user);
  return { ...user, displayName };
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  const auth = getFirebaseAuth();
  const result = await signInWithEmailAndPassword(auth, email, password);
  await setSessionCookie(result.user);
  const user = await getOrCreateUser(result.user);
  return user;
}

export async function signOutUser(): Promise<void> {
  clearSessionCookie();
  await signOut(getFirebaseAuth());
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export async function getUserData(uid: string): Promise<User | null> {
  const db = getFirebaseDb();
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data() as User;
  }
  return null;
}

async function getOrCreateUser(firebaseUser: FirebaseUser): Promise<User> {
  const db = getFirebaseDb();
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as User;
  }

  const newUser: User = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || '',
    photoURL: firebaseUser.photoURL,
    plan: 'free',
    createdAt: new Date(),
  };

  await setDoc(userRef, {
    ...newUser,
    createdAt: serverTimestamp(),
  });

  return newUser;
}
