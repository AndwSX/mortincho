import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private state = new BehaviorSubject<Notification>({
    message: '',
    type: 'success',
    visible: false
  });

  state$ = this.state.asObservable();

  show(message: string, type: 'success' | 'error' = 'success') {
    this.state.next({ message, type, visible: true });
    
    // Auto-ocultar después de 4 segundos
    timer(4000).subscribe(() => {
      this.close();
    });
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  close() {
    this.state.next({ ...this.state.value, visible: false });
  }
}
