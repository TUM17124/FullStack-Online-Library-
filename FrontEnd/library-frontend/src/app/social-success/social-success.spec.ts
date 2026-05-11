import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialSuccess } from './social-success';

describe('SocialSuccess', () => {
  let component: SocialSuccess;
  let fixture: ComponentFixture<SocialSuccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialSuccess]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialSuccess);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
