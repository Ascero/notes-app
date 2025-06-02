import { DatePipe, SlicePipe } from '@angular/common';
import { Component, inject, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Note } from '../../models/note.interface';
import { NotesService, SortOrder } from '../../services/notes.service';
import { NoteSearchComponent } from '../note-search/note-search';

@Component({
  selector: 'app-notes-list',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    DatePipe,
    SlicePipe,
    NoteSearchComponent,
  ],
  templateUrl: './notes-list.html',
  styleUrl: './notes-list.scss',
})
export class NotesListComponent {
  private readonly notesService = inject(NotesService);
  private readonly router = inject(Router);

  public readonly notes: Signal<Note[]> = this.notesService.filteredNotes;
  public readonly sortOrder: Signal<SortOrder> = this.notesService.sortOrder;

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

  public onSearchChanged(searchTerm: string): void {
    this.notesService.setSearchTerm(searchTerm);
  }

  public onSortOrderChanged(sortOrder: SortOrder): void {
    this.notesService.setSortOrder(sortOrder);
  }
}
