type EventHandler = (...args: any[]) => void;

class EventBus {
  private listeners: { [key: string]: EventHandler[] } = {};

  on(event: string, callback: EventHandler) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: EventHandler) {
    this.listeners[event] = (this.listeners[event] || []).filter(
      (cb) => cb !== callback
    );
  }

  emit(event: string, ...args: any[]) {
    (this.listeners[event] || []).forEach((callback) => callback(...args));
  }
}

const eventBus = new EventBus();

export default eventBus;
