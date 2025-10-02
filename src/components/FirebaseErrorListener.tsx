
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/lib/error-emitter';
import type { FirestorePermissionError } from '@/lib/errors';
import { useToast } from '@/hooks/use-toast';

// This component listens for Firestore permission errors and displays them as toasts.
// This is a developer-only tool to help debug security rules.
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error(error); // Log the full contextual error to the console for debugging
      
      // We are creating a toast to make the error highly visible to the developer.
      toast({
        variant: 'destructive',
        title: 'Firestore Security Rule Error',
        description: `Check the browser console for details on the denied request for path: ${error.context.path}`,
        duration: 10000,
      });
    };

    errorEmitter.on('permission-error', handleError);

    // No cleanup function is needed as the emitter should persist for the app's lifetime.
    // If we were to unmount this component, we would unsubscribe here.
  }, [toast]);

  return null; // This component does not render anything
}
