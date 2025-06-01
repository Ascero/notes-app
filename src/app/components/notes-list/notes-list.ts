import { DatePipe, SlicePipe } from '@angular/common';
import { Component, inject, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Note } from '../../models/note.interface';
import { NotesService } from '../../services/notes.service';

@Component({
  selector: 'app-notes-list',
  imports: [MatCardModule, MatButtonModule, MatIconModule, DatePipe, SlicePipe],
  templateUrl: './notes-list.html',
  styleUrl: './notes-list.scss',
})
export class NotesListComponent {
  private readonly notesService = inject(NotesService);
  private readonly router = inject(Router);

  public readonly notes: Signal<Note[]> = this.notesService.notes;

  public navigateToNoteCreation(): void {
    this.router.navigate(['/note/new']);
  }

  public navigateToNote(id: string): void {
    this.router.navigate(['/note', id]);
  }

  public deleteNote(event: Event, id: string): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this note?')) {
      this.notesService.deleteNote(id);
    }
  }
}
