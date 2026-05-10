import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

@Component({
  selector: 'app-pdf-reader',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],

  template: `


    <div *ngIf="pdfSrc === 'loading'" class="loading-pdf">
  Loading PDF...
    </div> 
    
    <!-- OVERLAY -->
    <div class="pdf-overlay"
         (click)="onOverlayClick($event)">

      <div class="pdf-container">

        <!-- TOOLBAR -->
        <div class="pdf-toolbar">

          <h3 class="toolbar-title">
            PDF Reader
          </h3>

          <button
            class="close-btn"
            (click)="onClose.emit()">

            ✕ Close

          </button>

        </div>

        <!-- MOBILE BLOCK -->
        <div *ngIf="isMobile"
             class="mobile-warning">

          <div class="warning-box">

            <h2>
              Desktop Required
            </h2>

            <p>
              PDF reading is only supported on
              laptops and desktop computers.
            </p>

            <p>
              Please open this platform on a computer
              for the best reading experience.
            </p>

          </div>

        </div>

        <!-- PDF VIEWER -->
<iframe
  #pdfFrame
  *ngIf="pdfSrc && pdfSrc !== 'loading' && !isMobile"
  [src]="pdfSrc | safeUrl"
  class="pdf-frame">
</iframe>

      </div>

    </div>

  `,

  styles: [`

    .pdf-overlay {
      pointer-events: auto;
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      backdrop-filter: blur(4px);
    }

    .pdf-container {
      width: 96vw;
      height: 96vh;
      background: #121212;
      border-radius: 14px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 40px rgba(0,0,0,0.6);
    }

    .pdf-toolbar {
      height: 70px;
      background: #1f1f1f;
      border-bottom: 1px solid #333;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.2rem;
      flex-shrink: 0;
    }

    .toolbar-title {
      color: white;
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .close-btn {
      border: none;
      background: #d32f2f;
      color: white;
      padding: 0.7rem 1.2rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: 0.2s ease;
    }

    .close-btn:hover {
      background: #b71c1c;
      transform: scale(1.03);
    }

    .pdf-frame {
      width: 100%;
      height: 100%;
      border: none;
      background: white;
      flex: 1;
      outline: none;
    }

    .mobile-warning {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      text-align: center;
    }

    .warning-box {
      max-width: 500px;
      background: #1e1e1e;
      border: 1px solid #333;
      padding: 2rem;
      border-radius: 14px;
    }

    .warning-box h2 {
      color: #ff5252;
      margin-bottom: 1rem;
    }

    .warning-box p {
      color: #ddd;
      line-height: 1.7;
      margin-bottom: 1rem;
    }

    .pdf-fallback {
      color: white;
      padding: 2rem;
    }

  `]

})
export class PdfReaderComponent implements OnInit {

  @Input() pdfSrc!: string | null;

  @Output() onClose =
    new EventEmitter<void>();

  isMobile = false;

  ngOnInit(): void {

    this.detectMobile();

  }

  detectMobile(): void {

    const width = window.innerWidth;

    this.isMobile =
      width <= 768 ||
      /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
        .test(navigator.userAgent);

  }

  onOverlayClick(event: MouseEvent) {

  const target = event.target as HTMLElement;

  if (target === event.currentTarget) {
    this.onClose.emit();
  }

}

}