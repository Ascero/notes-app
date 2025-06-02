import { Component, computed, effect, inject, input, linkedSignal, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { Note } from '../../models/note.interface';
import { NotesService } from '../../services/notes.service';

@Component({
  selector: 'app-note-edit',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatToolbarModule],
  templateUrl: './note-edit.html',
  styleUrl: './note-edit.scss',
})
export class NoteEditComponent {
  public readonly id = input.required<string>();

  public readonly note: Signal<Note | null> = computed(() => this.notesService.getNoteById(this.id()) ?? null);
  public readonly isNewNote: Signal<boolean> = computed(() => this.router.url === '/note/new');
  public readonly title = linkedSignal(() => this.note()?.title ?? '');
  public readonly content = linkedSignal(() => this.note()?.content ?? '');

  public readonly canSave: Signal<boolean> = computed(
    () => this.title().trim().length > 0 || this.content().trim().length > 0
  );

  private readonly router = inject(Router);
  private readonly notesService = inject(NotesService);

  constructor() {
    effect(() => {
      const currentNote = this.note();
      const currentId = this.id();

      if (currentId && !currentNote) {
        this.router.navigate(['/']);
      }
    });
  }

  public updateTitle(value: string): void {
    this.title.set(value);
  }

  public updateContent(value: string): void {
    this.content.set(value);
  }

  public save(): void {
    const trimmedTitle = this.title().trim();
    const trimmedContent = this.content().trim();

    if (this.isNewNote()) {
      this.notesService.createNote(trimmedTitle, trimmedContent);

      this.router.navigate(['/']);
    } else {
      const currentNote = this.note();

      if (currentNote) {
        const updatedNote = this.notesService.updateNote(currentNote.id, trimmedTitle, trimmedContent);

        if (updatedNote) {
          this.router.navigate(['/note', currentNote.id]);
        }
      }
    }
  }

  public cancel(): void {
    const currentNote = this.note();

    if (currentNote) {
      this.router.navigate(['/note', currentNote.id]);
    } else {
      this.goBack();
    }
  }

  public goBack(): void {
    this.router.navigate(['/']);
  }
}
