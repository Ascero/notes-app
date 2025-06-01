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
});
