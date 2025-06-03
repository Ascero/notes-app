import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog';
import { ConfirmationService } from './confirmation.service';

describe('ConfirmationService', () => {
  let service: ConfirmationService;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<ConfirmationDialogComponent>>;

  beforeEach(() => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      providers: [{ provide: MatDialog, useValue: mockDialog }],
    });
    service = TestBed.inject(ConfirmationService);
  });

  describe('When confirming', () => {
    it('should open dialog with correct data and return observable', () => {
      const testData = {
        title: 'Test Title',
        message: 'Test message',
        confirmText: 'Yes',
        cancelText: 'No',
      };

      mockDialog.open.and.returnValue(mockDialogRef);
      mockDialogRef.afterClosed.and.returnValue(of(true));

      const result = service.confirm(testData);

      expect(mockDialog.open).toHaveBeenCalledWith(ConfirmationDialogComponent, {
        width: '400px',
        data: testData,
      });

      result.subscribe((confirmed) => {
        expect(confirmed).toBe(true);
      });
    });

    it('should return false when dialog is cancelled', () => {
      const testData = {
        title: 'Test',
        message: 'Test',
      };

      mockDialog.open.and.returnValue(mockDialogRef);
      mockDialogRef.afterClosed.and.returnValue(of(false));

      const result = service.confirm(testData);

      result.subscribe((confirmed) => {
        expect(confirmed).toBe(false);
      });
    });

    it('should return undefined when dialog is closed without selection', () => {
      const testData = {
        title: 'Test',
        message: 'Test',
      };

      mockDialog.open.and.returnValue(mockDialogRef);
      mockDialogRef.afterClosed.and.returnValue(of(undefined));

      const result = service.confirm(testData);

      result.subscribe((confirmed) => {
        expect(confirmed).toBeUndefined();
      });
    });
  });

  describe('when confirming deletion', () => {
    it('should open dialog with default delete configuration', () => {
      mockDialog.open.and.returnValue(mockDialogRef);
      mockDialogRef.afterClosed.and.returnValue(of(true));

      service.confirmDelete();

      expect(mockDialog.open).toHaveBeenCalledWith(ConfirmationDialogComponent, {
        width: '400px',
        data: {
          title: 'Confirm Delete',
          message: 'Are you sure you want to delete this item?',
          confirmText: 'Delete',
          cancelText: 'Cancel',
        },
      });
    });

    it('should open dialog with custom item name', () => {
      mockDialog.open.and.returnValue(mockDialogRef);
      mockDialogRef.afterClosed.and.returnValue(of(true));

      service.confirmDelete('note');

      expect(mockDialog.open).toHaveBeenCalledWith(ConfirmationDialogComponent, {
        width: '400px',
        data: {
          title: 'Confirm Delete',
          message: 'Are you sure you want to delete note?',
          confirmText: 'Delete',
          cancelText: 'Cancel',
        },
      });
    });

    it('should return observable that emits dialog result', () => {
      mockDialog.open.and.returnValue(mockDialogRef);
      mockDialogRef.afterClosed.and.returnValue(of(true));

      const result = service.confirmDelete('test item');

      result.subscribe((confirmed) => {
        expect(confirmed).toBe(true);
      });
    });
  });
});
