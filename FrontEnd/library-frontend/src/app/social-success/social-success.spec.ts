import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialSuccessComponent } from './social-success';

describe('SocialSuccessComponent', () => {
  let component: SocialSuccessComponent;
  let fixture: ComponentFixture<SocialSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialSuccessComponent  ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
