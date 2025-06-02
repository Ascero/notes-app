import { computed, Injectable, Signal, signal } from '@angular/core';
import { Note } from '../models/note.interface';

const NOTE_STORAGE_KEY = 'notes';

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  private readonly notesSignal = signal<Note[]>(this.loadInitialNotes());
  private readonly searchTermSignal = signal<string>('');

  public readonly notes: Signal<Note[]> = this.notesSignal.asReadonly();
  public readonly notesCount = computed(() => this.notes().length);
  public readonly searchTerm: Signal<string> = this.searchTermSignal.asReadonly();

  public readonly filteredNotes = computed(() => {
    const notes = this.notes();
    const searchTerm = this.searchTerm().toLowerCase().trim();

    if (!searchTerm) {
      return notes;
    }

    return notes.filter((note) => note.title.toLowerCase().includes(searchTerm));
  });

  public getNoteById(id: string): Note | undefined {
    return this.notes().find((note) => note.id === id);
  }

  public createNote(title: Note['title'], content: Note['content']): Note {
    const newNote: Note = {
      id: this.generateId(),
      title: title,
      content: content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.notesSignal.update((notes) => [...notes, newNote]);
    this.persistNotes(this.notes());

    return newNote;
  }

  public updateNote(id: string, title: Note['title'], content: Note['content']): Note | null {
    const noteIndex = this.notes().findIndex((note) => note.id === id);

    if (noteIndex === -1) {
      return null;
    }

    const updatedNote: Note = {
      ...this.notes()[noteIndex],
      title,
      content,
      updatedAt: new Date(),
    };

    this.notesSignal.update((notes) => {
      const notesToUpdate = [...notes];

      notesToUpdate[noteIndex] = updatedNote;

      return notesToUpdate;
    });
    this.persistNotes(this.notes());

    return updatedNote;
  }

  public deleteNote(id: string): void {
    this.notesSignal.update((notes) => notes.filter((note) => note.id !== id));

    this.persistNotes(this.notes());
  }

  public setSearchTerm(searchTerm: string): void {
    this.searchTermSignal.set(searchTerm);
  }

  private loadInitialNotes(): Note[] {
    try {
      const notesData = localStorage.getItem(NOTE_STORAGE_KEY);

      if (notesData) {
        const notes: Note[] = JSON.parse(notesData).map((note: Note) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }));
        return notes;
      }
      return [];
    } catch (error) {
      // We should handle this in a better showing some feedback to the user.
      console.error('Failed to load notes:', error);
      return [];
    }
  }

  private persistNotes(notes: Note[]): void {
    try {
      const notesData = JSON.stringify(notes);

      localStorage.setItem(NOTE_STORAGE_KEY, notesData);
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  }

  // Added this ID generation just to have a complete Note generated, but for sure it will be better to rely in a backend generated ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
