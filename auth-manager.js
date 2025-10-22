// Authentication management
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, signInWithPopup, googleProvider } from './firebase-config.js';

export class AuthManager {
    constructor() {
        this.currentUser = null;
        this.authStateListeners = [];
    }

    // Add auth state change listener
    onAuthStateChange(callback) {
        this.authStateListeners.push(callback);
    }

    // Initialize auth state listener
    init() {
        onAuthStateChanged(auth, (user) => {
            this.currentUser = user;
            this.authStateListeners.forEach(callback => callback(user));
        });
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Sign in with email and password
    async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            this.currentUser = userCredential.user;
            return userCredential.user;
        } catch (error) {
            throw new Error('Login failed: ' + error.message);
        }
    }

    // Create new user account
    async signUp(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            this.currentUser = userCredential.user;
            return userCredential.user;
        } catch (error) {
            throw new Error('Registration failed: ' + error.message);
        }
    }

    // Sign out
    async signOut() {
        try {
            await signOut(auth);
            this.currentUser = null;
        } catch (error) {
            throw new Error('Logout failed: ' + error.message);
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Sign in with Google
    async signInWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            this.currentUser = result.user;
            return result.user;
        } catch (error) {
            throw new Error('Google sign-in failed: ' + error.message);
        }
    }
}
