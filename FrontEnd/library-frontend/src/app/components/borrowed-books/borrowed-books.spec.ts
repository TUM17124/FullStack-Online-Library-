import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BorrowedBooks } from './borrowed-books';

describe('BorrowedBooks', () => {
  let component: BorrowedBooks;
  let fixture: ComponentFixture<BorrowedBooks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BorrowedBooks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BorrowedBooks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
