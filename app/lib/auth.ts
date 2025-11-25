// ============================================================================
// Authentication Utilities - Working with User Sessions
// ============================================================================
// These helpers make it easier to work with authentication throughout the app.
// They handle getting the current user, checking if someone is logged in,
// and managing session state.

import { supabase } from './supabase';

// ============================================================================
// Get Current User Session
// ============================================================================
// Returns the user that's currently logged in, or null if not authenticated
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }

    return user;
  } catch (err) {
    console.error('Unexpected error getting current user:', err);
    return null;
  }
};

// ============================================================================
// Get Current Session
// ============================================================================
// Returns the current session data (access token, refresh token, etc.)
export const getSession = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    return session;
  } catch (err) {
    console.error('Unexpected error getting session:', err);
    return null;
  }
};

// ============================================================================
// Sign Out / Log Out
// ============================================================================
// Clear the user's session and log them out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error signing out:', err);
    return false;
  }
};

// ============================================================================
// Listen to Auth Changes
// ============================================================================
// Watch for when someone logs in or out
// Useful for updating the UI in real-time
export const onAuthStateChange = (callback: (user: any | null) => void) => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      callback(session.user);
    } else {
      callback(null);
    }
  });

  // Return unsubscribe function so callers can clean up
  return subscription?.unsubscribe;
};

// ============================================================================
// Check if User is Admin
// ============================================================================
// Checks the user's metadata to see if they are marked as admin.
// Admins have access to all projects and can manage others' work.
export const isAdmin = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return false;
    }

    // Check user_metadata for is_admin flag
    const isAdminFlag = (user.user_metadata as any)?.is_admin === true;
    return isAdminFlag;
  } catch (err) {
    console.error('Error checking admin status:', err);
    return false;
  }
};

// ============================================================================
// Get User Role
// ============================================================================
// Returns the user's role: 'admin', 'user', or null if not authenticated.
// Useful for conditional UI rendering and authorization checks.
export const getUserRole = async (): Promise<
  'admin' | 'user' | null
> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return null;
    }

    const isAdminFlag = (user.user_metadata as any)?.is_admin === true;
    return isAdminFlag ? 'admin' : 'user';
  } catch (err) {
    console.error('Error getting user role:', err);
    return null;
  }
};
