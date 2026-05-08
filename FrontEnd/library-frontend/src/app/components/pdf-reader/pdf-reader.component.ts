import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-pdf-reader',
  standalone: true,
  imports: [CommonModule, PdfViewerModule],
  template: `
    <div class="pdf-wrapper">
      <button class="close-btn" (click)="onClose.emit()">✕</button>

      <pdf-viewer
        *ngIf="pdfSrc"
        [src]="pdfSrc"
        [render-text]="true"
        [show-all]="true"
        [zoom]="1.2"
        style="display:block; width:100%; height:100vh;">
      </pdf-viewer>
    </div>
  `,
  styles: [`
    .pdf-wrapper {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.9);
      z-index: 1000;
    }

    .close-btn {
      position: absolute;
      top: 10px;
      right: 15px;
      z-index: 1001;
      font-size: 1.5rem;
      background: transparent;
      color: white;
      border: none;
      cursor: pointer;
    }
  `]
})
export class PdfReaderComponent {
  @Input() pdfSrc: string | null = null;

  // IMPORTANT: parent controls closing
  @Output() onClose = new EventEmitter<void>();
}