// pdf-reader.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-pdf-reader',
  standalone: true,
  imports: [CommonModule, PdfViewerModule],
  template: `
    <div class="pdf-overlay" *ngIf="pdfSrc">
      <button class="close-btn" (click)="closeReader()">✕</button>
      <pdf-viewer
        [src]="pdfSrc"
        [render-text]="true"
        [show-all]="true"
        [zoom]="1.2"
        style="display:block; width:100%; height:100vh;">
      </pdf-viewer>
    </div>
  `,
  styles: [`
    .pdf-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.8);
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
  @Input() pdfSrc!: string | null;

  closeReader() {
    this.pdfSrc = null;
  }
}