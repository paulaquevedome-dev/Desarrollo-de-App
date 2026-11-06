import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServerConfigPage } from './server-config.page';

describe('ServerConfigPage', () => {
  let component: ServerConfigPage;
  let fixture: ComponentFixture<ServerConfigPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerConfigPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
