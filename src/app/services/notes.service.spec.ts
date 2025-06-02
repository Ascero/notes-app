import { TestBed } from '@angular/core/testing';
import { Note } from '../models/note.interface';
import { NotesService } from './notes.service';

describe('NotesService', () => {
  let service: NotesService, mockNote: Note, mockNotesData: string;

  beforeEach(() => {
    localStorage.clear();

    mockNote = {
      id: 'test-id',
      title: 'Test Note',
      content: 'Test content',
      createdAt: new Date('2023-01-01T00:00:00.000Z'),
      updatedAt: new Date('2023-01-01T00:00:00.000Z'),
    };
    mockNotesData = JSON.stringify([mockNote]);

    TestBed.configureTestingModule({
      providers: [NotesService],
    });

    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'setItem');
    spyOn(localStorage, 'removeItem');

    service = TestBed.inject(NotesService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should not persist during initialization', () => {
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('should get 0 as notes count', () => {
    expect(service.notesCount()).toBe(0);
  });

  describe('when creating a note', () => {
    let createdNote: Note;

    beforeEach(() => {
      createdNote = service.createNote('New Title', 'New Content');
    });

    it('should create a new note and add it to the collection', () => {
      expect(createdNote.title).toBe('New Title');
      expect(createdNote.content).toBe('New Content');
      expect(createdNote.createdAt).toBeInstanceOf(Date);
      expect(createdNote.updatedAt).toBeInstanceOf(Date);
      expect(service.notes()).toContain(createdNote);
    });

    it('should update notesCount computed signal', () => {
      expect(service.notesCount()).toBe(1);
    });

    it('should call local storage setItem', () => {
      expect(localStorage.setItem).toHaveBeenCalledWith('notes', jasmine.any(String));
    });

    it('should return note when found', () => {
      const foundNote = service.getNoteById(createdNote.id);

      expect(foundNote).toEqual(createdNote);
    });

    it('should return undefined when note not found', () => {
      const result = service.getNoteById('non-existent-id');

      expect(result).toBeUndefined();
    });
  });

  describe('when updating a note', () => {
    let createdNote: Note, updatedNote: Note | null;

    beforeEach(() => {
      createdNote = service.createNote('New Title', 'New Content');

      updatedNote = service.updateNote(createdNote.id, 'Updated Title', 'Updated Content');
    });

    it('should update existing note and return updated note', () => {
      expect(updatedNote).toBeTruthy();
      expect(updatedNote?.id).toBe(createdNote.id);
      expect(updatedNote?.title).toBe('Updated Title');
      expect(updatedNote?.content).toBe('Updated Content');
      expect(updatedNote?.updatedAt).toBeInstanceOf(Date);
      expect(updatedNote?.updatedAt.getTime()).toBeGreaterThanOrEqual(createdNote.updatedAt.getTime());
      expect(updatedNote?.title).toBe('Updated Title');
      expect(updatedNote?.content).toBe('Updated Content');
      expect(updatedNote?.createdAt).toEqual(createdNote.createdAt);
    });

    it('should return null when note not found', () => {
      const result = service.updateNote('non-existent-id', 'Title', 'Content');

      expect(result).toBeNull();
    });

    it('should call local storage setItem', () => {
      expect(localStorage.setItem).toHaveBeenCalledWith('notes', jasmine.any(String));
    });
  });

  describe('when deleting a note', () => {
    let createdNote: Note;

    beforeEach(() => {
      createdNote = service.createNote('New Title', 'New Content');

      service.deleteNote(createdNote.id);
    });

    it('should delete existing note', () => {
      expect(service.getNoteById(createdNote.id)).toBeUndefined();
      expect(service.notesCount()).toBe(0);
    });

    it('should do nothing when note not found', () => {
      const initialCount = service.notesCount();

      service.deleteNote('non-existent-id');

      expect(service.notesCount()).toBe(initialCount);
    });

    it('should call local storage setItem', () => {
      expect(localStorage.setItem).toHaveBeenCalledWith('notes', jasmine.any(String));
    });
  });

  describe('when localStorage throws an error', () => {
    beforeEach(() => {
      (localStorage.setItem as jasmine.Spy).and.throwError('Storage failed');

      spyOn(console, 'error');
    });

    it('should handle localStorage errors during persistence', () => {
      service.createNote('Test', 'Content');

      expect(console.error).toHaveBeenCalledWith('Failed to save notes:', jasmine.any(Error));
    });

    it('should continue working after persistence errors', () => {
      service.createNote('Test', 'Content');

      expect(service.notesCount()).toBe(1);
    });
  });

  describe('when initializing the service with notes', () => {
    let newService: NotesService;

    beforeEach(() => {
      localStorage.clear();
      (localStorage.getItem as jasmine.Spy).and.returnValue(mockNotesData);

      newService = new NotesService();
    });

    it('should auto-load notes from localStorage on initialization', () => {
      expect(localStorage.getItem).toHaveBeenCalledWith('notes');
      expect(newService.notes().length).toBe(1);
      expect(newService.notes()[0]).toEqual(mockNote);
    });
  });

  describe('when initializing with invalid notes', () => {
    let newService: NotesService;

    beforeEach(() => {
      localStorage.clear();
      (localStorage.getItem as jasmine.Spy).and.returnValue('invalid json data');
      spyOn(console, 'error');

      newService = new NotesService();
    });

    it('should handle JSON parse errors and return empty array', () => {
      expect(console.error).toHaveBeenCalledWith('Failed to load notes:', jasmine.any(Error));
      expect(newService.notes().length).toBe(0);
    });
  });

  describe('when searching', () => {
    beforeEach(() => {
      service.createNote('JavaScript Tutorial', 'Learn JavaScript basics');
      service.createNote('Angular Guide', 'Complete Angular tutorial');
      service.createNote('CSS Tips', 'CSS styling techniques');
      service.createNote('Vue Tutorial', 'Vue.js fundamentals');
    });

    it('should have empty search term initially', () => {
      expect(service.searchTerm()).toBe('');
    });

    it('should return all notes when search term is empty', () => {
      expect(service.filteredNotes().length).toBe(4);
    });

    it('should filter notes by title', () => {
      service.setSearchTerm('angular');

      expect(service.filteredNotes().length).toBe(1);
      expect(service.filteredNotes()[0].title).toBe('Angular Guide');
    });

    it('should return empty array when no notes match search term', () => {
      service.setSearchTerm('Python');

      expect(service.filteredNotes().length).toBe(0);
    });

    it('should trim whitespace from search term', () => {
      service.setSearchTerm('  css  ');

      expect(service.filteredNotes().length).toBe(1);
      expect(service.filteredNotes()[0].title).toBe('CSS Tips');
    });
  });

  describe('when sorting', () => {
    let firstNote: Note, secondNote: Note, thirdNote: Note;

    beforeEach(() => {
      service = new NotesService();

      firstNote = service.createNote('First Note', 'Content 1');

      secondNote = service.createNote('Second Note', 'Content 2');
      secondNote.createdAt = new Date(Date.now() + 1000);
      secondNote.updatedAt = new Date(Date.now() + 1000);

      thirdNote = service.createNote('Third Note', 'Content 3');
      thirdNote.createdAt = new Date(Date.now() + 2000);
      thirdNote.updatedAt = new Date(Date.now() + 2000);

      service['notesSignal'].set([firstNote, secondNote, thirdNote]);
    });

    it('should have newest sort order initially', () => {
      expect(service.sortOrder()).toBe('newest');
    });

    it('should sort notes by newest first by default', () => {
      const filteredNotes = service.filteredNotes();

      expect(filteredNotes.length).toBe(3);
      expect(filteredNotes[0].title).toBe('Third Note');
      expect(filteredNotes[1].title).toBe('Second Note');
      expect(filteredNotes[2].title).toBe('First Note');
    });

    it('should sort notes by oldest first when sort order is oldest', () => {
      service.setSortOrder('oldest');

      const filteredNotes = service.filteredNotes();

      expect(filteredNotes.length).toBe(3);
      expect(filteredNotes[0].title).toBe('First Note');
      expect(filteredNotes[1].title).toBe('Second Note');
      expect(filteredNotes[2].title).toBe('Third Note');
    });

    it('should apply sorting to filtered search results', () => {
      const baseTime = new Date('2023-06-01T10:00:00.000Z').getTime();
      const angularNote = service.createNote('Angular Advanced', 'Advanced Angular concepts');

      angularNote.createdAt = new Date(baseTime);
      angularNote.updatedAt = new Date(baseTime);

      const currentNotes = service.notes();
      const updatedNotes = [...currentNotes.slice(0, -1), angularNote];
      service['notesSignal'].set(updatedNotes);

      service.setSearchTerm('angular');
      service.setSortOrder('oldest');

      const filteredNotes = service.filteredNotes();

      expect(filteredNotes.length).toBe(1);
      expect(filteredNotes[0].title).toBe('Angular Advanced');
    });
  });
});
