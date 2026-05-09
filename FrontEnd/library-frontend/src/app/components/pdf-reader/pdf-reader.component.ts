import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

@Component({
  selector: 'app-pdf-reader',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],
  template: `
    <div class="pdf-overlay" (click)="onOverlayClick($event)">
      <div class="pdf-container">

        <div class="pdf-toolbar">
          <button class="close-btn" (click)="onClose.emit()">
            ✕ Close
          </button>
        </div>

        <object
          *ngIf="pdfSrc"
          [data]="pdfSrc | safeUrl"
          type="application/pdf"
          class="pdf-frame">
        </object>

      </div>
    </div>
  `,
  styles: [`
    .pdf-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .pdf-container {
      width: 95vw;
      max-width: 1400px;
      height: 95vh;
      background: #111;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
    }

    .pdf-toolbar {
      display: flex;
      justify-content: flex-end;
      padding: 0.8rem 1rem;
      background: #1e1e1e;
      border-bottom: 1px solid #333;
      flex-shrink: 0;
    }

    .close-btn {
      background: #d32f2f;
      color: white;
      border: none;
      padding: 0.65rem 1.2rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
    }

    .close-btn:hover {
      background: #b71c1c;
    }

    .pdf-frame {
      flex: 1;
      width: 100%;
      height: 100%;
      border: none;
      background: white;
    }
  `]
})
export class PdfReaderComponent {
  @Input() pdfSrc!: string | null;

  @Output() onClose = new EventEmitter<void>();

  onOverlayClick(event: MouseEvent) {
    // Close when clicking outside the container
    if ((event.target as HTMLElement).classList.contains('pdf-overlay')) {
      this.onClose.emit();
    }
  }
}