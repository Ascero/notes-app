import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData,
} from '../components/confirmation-dialog/confirmation-dialog';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  private readonly dialog = inject(MatDialog);

  public confirm(data: ConfirmationDialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data,
    });

    return dialogRef.afterClosed();
  }

  public confirmDelete(itemName = 'this item'): Observable<boolean> {
    return this.confirm({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete ${itemName}?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });
  }
}
