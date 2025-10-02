
// A simple event emitter for our app
// This is used to create a global error handler for Firestore permission errors
type Listener = (data: any) => void;

class EventEmitter {
  private listeners: { [key: string]: Listener[] } = {};

  on(event: string, listener: Listener): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  emit(event: string, data: any): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }
}

export const errorEmitter = new EventEmitter();
