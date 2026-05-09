import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

@Component({
  selector: 'app-pdf-reader',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],
  template: `
    <div class="pdf-container">

      <div class="pdf-toolbar">
        <button class="close-btn" (click)="onClose.emit()">
          ✕ Close
        </button>
      </div>

      <iframe
        *ngIf="pdfSrc"
        [src]="pdfSrc | safeUrl"
        class="pdf-frame">
      </iframe>

    </div>
  `,
  styles: [`
    .pdf-container{
      width:100%;
      height:100%;
      display:flex;
      flex-direction:column;
      background:#111;
      border-radius:10px;
      overflow:hidden;
    }

    .pdf-toolbar{
      display:flex;
      justify-content:flex-end;
      padding:0.7rem;
      background:#1e1e1e;
      border-bottom:1px solid #333;
    }

    .close-btn{
      background:#d32f2f;
      color:white;
      border:none;
      padding:0.6rem 1rem;
      border-radius:6px;
      cursor:pointer;
      font-weight:600;
    }

    .close-btn:hover{
      opacity:0.9;
    }

    .pdf-frame{
      width:100%;
      height:100%;
      min-height:85vh;
      border:none;
      background:white;
      flex:1;
    }
  `]
})
export class PdfReaderComponent {
  @Input() pdfSrc!: string | null;

  @Output() onClose = new EventEmitter<void>();
}