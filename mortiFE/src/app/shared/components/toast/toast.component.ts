import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
        class="fixed top-6 left-1/2 -translate-x-1/2 z-[2000] transition-all duration-500 ease-in-out"
        [ngClass]="state.visible ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0 pointer-events-none'">
        
        <div 
            class="flex items-center gap-3 px-6 py-3 rounded-2xl glass shadow-2xl border-l-4 min-w-[300px]"
            [ngClass]="state.type === 'success' ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'">
            
            <div class="flex-shrink-0">
                <i *ngIf="state.type === 'success'" class="bi bi-check-circle-fill text-green-500 text-xl"></i>
                <i *ngIf="state.type === 'error'" class="bi bi-exclamation-triangle-fill text-red-500 text-xl"></i>
            </div>
            
            <div class="flex-1">
                <p class="text-sm font-semibold text-white">{{ state.message }}</p>
            </div>

            <button (click)="close()" class="text-white/40 hover:text-white transition-colors ml-2">
                <i class="bi bi-x"></i>
            </button>
        </div>
    </div>
  `
})
export class ToastComponent implements OnInit {
  state: Notification = { message: '', type: 'success', visible: false };

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.state$.subscribe(state => {
      this.state = state;
    });
  }

  close() {
    this.notificationService.close();
  }
}
