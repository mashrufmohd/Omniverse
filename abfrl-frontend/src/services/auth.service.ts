import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  role: 'user' | 'shopkeeper';
  createdAt: Date;
}

export const authService = {
  // Sign up new user
  async signUp(email: string, password: string, displayName: string, role: 'user' | 'shopkeeper' = 'user') {
    try {
      console.log('  📝 Creating Firebase user account...')
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('  ✓ User created with UID:', user.uid)

      console.log('  📝 Updating user profile...')
      await updateProfile(user, { displayName });
      console.log('  ✓ Profile updated with name:', displayName)

      // Try to create user profile in Firestore (optional, don't fail if Firestore is offline)
      try {
        console.log(`  📝 Saving user profile to Firestore with role: ${role}`)
        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email!,
          displayName,
          role,
          createdAt: new Date(),
        };

        await setDoc(doc(db, 'users', user.uid), userProfile);
        console.log('  ✓ User profile saved to Firestore')
      } catch (firestoreError) {
        console.warn('  ⚠️  Could not save to Firestore (optional):', firestoreError);
        // Don't throw - Firestore is optional for authentication
      }

      return userCredential;
    } catch (error: any) {
      console.error('Sign up error:', error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Email already in use');
      }
      throw new Error(error.message || 'Failed to create account');
    }
  },

  // Sign in existing user
  async signIn(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  // Sign out
  async signOut() {
    await firebaseSignOut(auth);
  },

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // Get user profile from Firestore
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  },
};
