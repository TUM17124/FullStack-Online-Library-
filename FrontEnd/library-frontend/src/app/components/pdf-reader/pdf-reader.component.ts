import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-pdf-reader',
  standalone: true,
  imports: [CommonModule, PdfViewerModule],
  template: `

    <div class="pdf-container">

      <div class="toolbar">
        <button (click)="onClose.emit()">
          Close
        </button>
      </div>

      <pdf-viewer
        *ngIf="pdfSrc"
        [src]="pdfSrc"
        [render-text]="true"
        [original-size]="false"
        [show-all]="true"
        style="display:block;width:100%;height:100vh;"
      >
      </pdf-viewer>

    </div>

  `,
  styles: [`

    .pdf-container{
      width:100%;
      height:100%;
      background:#111;
    }

    .toolbar{
      padding:1rem;
      background:#222;
    }

    button{
      padding:0.6rem 1rem;
      border:none;
      background:#d32f2f;
      color:white;
      border-radius:6px;
    }

  `]
})
export class PdfReaderComponent {

  @Input() pdfSrc!: string;

  @Output() onClose = new EventEmitter<void>();

}