import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogComponent, ConfirmationDialogData } from './confirmation-dialog';

describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<ConfirmationDialogComponent>>;
  let mockData: ConfirmationDialogData;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockData = {
      title: 'Test Title',
      message: 'Test message',
      confirmText: 'Yes',
      cancelText: 'No',
    };

    await TestBed.configureTestingModule({
      imports: [ConfirmationDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display dialog data correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Test Title');
    expect(compiled.querySelector('p')?.textContent).toContain('Test message');
    expect(compiled.querySelector('[mat-button]:nth-child(1)')?.textContent?.trim()).toBe('No');
    expect(compiled.querySelector('[mat-button]:nth-child(2)')?.textContent?.trim()).toBe('Yes');
  });

  it('should use default button texts when not provided', async () => {
    const defaultData = {
      title: 'Default Title',
      message: 'Default message',
    };

    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ConfirmationDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: defaultData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[mat-button]:nth-child(1)')?.textContent?.trim()).toBe('Cancel');
    expect(compiled.querySelector('[mat-button]:nth-child(2)')?.textContent?.trim()).toBe('Confirm');
  });

  it('should handle confirm button click', () => {
    const confirmButton = fixture.nativeElement.querySelector('[mat-button]:nth-child(2)') as HTMLButtonElement;
    confirmButton.click();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should handle cancel button click', () => {
    const cancelButton = fixture.nativeElement.querySelector('[mat-button]:nth-child(1)') as HTMLButtonElement;
    cancelButton.click();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should close dialog with true when onConfirm is called', () => {
    component.onConfirm();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should close dialog with false when onCancel is called', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });
});
