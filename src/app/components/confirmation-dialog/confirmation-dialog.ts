import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <div mat-dialog-content>
      <p>{{ data.message }}</p>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onCancel()">{{ data.cancelText || 'Cancel' }}</button>
      <button mat-button color="primary" (click)="onConfirm()" cdkFocusInitial>
        {{ data.confirmText || 'Confirm' }}
      </button>
    </div>
  `,
  styles: [
    `
      [mat-dialog-actions] {
        justify-content: flex-end;
        gap: 8px;
      }
    `,
  ],
})
export class ConfirmationDialogComponent {
  public readonly data = inject<ConfirmationDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ConfirmationDialogComponent>);

  public onConfirm(): void {
    this.dialogRef.close(true);
  }

  public onCancel(): void {
    this.dialogRef.close(false);
  }
}
