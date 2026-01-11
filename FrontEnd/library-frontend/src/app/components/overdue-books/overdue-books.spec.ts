import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverdueBooks } from './overdue-books';

describe('OverdueBooks', () => {
  let component: OverdueBooks;
  let fixture: ComponentFixture<OverdueBooks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverdueBooks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverdueBooks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
