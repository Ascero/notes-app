import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { Note } from '../../models/note.interface';
import { ConfirmationService } from '../../services/confirmation.service';
import { NotesService } from '../../services/notes.service';

@Component({
  selector: 'app-note-detail',
  imports: [MatButtonModule, MatIconModule, MatToolbarModule, DatePipe],
  templateUrl: './note-detail.html',
  styleUrl: './note-detail.scss',
})
export class NoteDetailComponent {
  public readonly id = input.required<string>();

  public readonly note: Signal<Note | null> = computed(() => this.notesService.getNoteById(this.id()) ?? null);

  private readonly router = inject(Router);
  private readonly notesService = inject(NotesService);
  private readonly confirmationService = inject(ConfirmationService);

  constructor() {
    effect(() => {
      const currentNote = this.note();

      if (!currentNote) {
        this.router.navigate(['/']);
      }
    });
  }

  public editNote(): void {
    const currentNote = this.note();

    if (currentNote) {
      this.router.navigate(['/note', currentNote.id, 'edit']);
    }
  }

  public delete(): void {
    const currentNote = this.note();

    if (currentNote) {
      this.confirmationService.confirmDelete(currentNote.title).subscribe((confirmed) => {
        if (confirmed) {
          this.notesService.deleteNote(currentNote.id);
          this.router.navigate(['/']);
        }
      });
    }
  }

  public goBack(): void {
    this.router.navigate(['/']);
  }

  public printNote(): void {
    window.print();
  }
}
