import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shared-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
        class="fixed inset-0 z-[1000] flex justify-end transition-all duration-500 drawer-ease"
        [ngClass]="isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'">
        
        <!-- Overlay -->
        <div 
            (click)="onClose()"
            class="absolute inset-0 bg-black/60 backdrop-blur-md transition-all duration-500 drawer-ease">
        </div>

        <!-- Drawer Container -->
        <div 
            class="relative w-full max-w-md h-full bg-[#09090b] border-l border-white/5 shadow-2xl transition-transform duration-500 drawer-ease p-8 flex flex-col"
            [ngClass]="isOpen ? 'translate-x-0' : 'translate-x-full'">
            
            <!-- Header -->
            <div class="flex items-center justify-between mb-10">
                <div>
                    <h2 class="text-2xl font-bold text-white mb-1">{{ title }}</h2>
                    <p class="text-gray-500 text-sm font-light">{{ subtitle }}</p>
                </div>
                <button (click)="onClose()" class="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                    <i class="bi bi-x-lg text-xl"></i>
                </button>
            </div>

            <!-- Content Slot -->
            <div class="flex-1 overflow-y-auto no-scrollbar">
                <ng-content></ng-content>
            </div>

            <!-- Footer Slot -->
            <div class="pt-8 flex gap-3 mt-auto">
                <ng-content select="[footer]"></ng-content>
            </div>
        </div>
    </div>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class SharedDrawerComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
