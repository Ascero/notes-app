import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { Note } from '../../models/note.interface';
import { NotesService } from '../../services/notes.service';
import { NoteEditComponent } from './note-edit';

@Component({
  template: '<app-note-edit [id]="noteId" />',
  standalone: true,
  imports: [NoteEditComponent],
})
class TestHostComponent {
  noteId = 'test-id';
}

describe('NoteEditComponent', () => {
  let component: NoteEditComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let notesService: jasmine.SpyObj<NotesService>;
  let router: jasmine.SpyObj<Router>;

  const mockNote: Note = {
    id: 'test-id',
    title: 'Test Note',
    content: 'Test content',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  beforeEach(async () => {
    const notesServiceSpy = jasmine.createSpyObj('NotesService', ['getNoteById', 'createNote', 'updateNote']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [NoteEditComponent, TestHostComponent, NoopAnimationsModule],
      providers: [
        { provide: NotesService, useValue: notesServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    component = fixture.debugElement.children[0].componentInstance;
    notesService = TestBed.inject(NotesService) as jasmine.SpyObj<NotesService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  describe('when editing existing note', () => {
    beforeEach(() => {
      notesService.getNoteById.and.returnValue(mockNote);
      Object.defineProperty(router, 'url', {
        get: () => '/note/test-id',
        configurable: true,
      });
      fixture.detectChanges();
    });

    it('should get note by id from service', () => {
      expect(notesService.getNoteById).toHaveBeenCalledWith('test-id');
      expect(component.note()).toEqual(mockNote);
    });

    it('should initialize title and content from note', () => {
      expect(component.title()).toBe('Test Note');
      expect(component.content()).toBe('Test content');
    });

    it('should determine it is not a new note', () => {
      expect(component.isNewNote()).toBe(false);
    });

    it('should update title', () => {
      component.updateTitle('New Title');
      expect(component.title()).toBe('New Title');
    });

    it('should update content', () => {
      component.updateContent('New Content');
      expect(component.content()).toBe('New Content');
    });

    it('should update existing note', () => {
      const updatedNote: Note = { ...mockNote, title: 'Updated Title', content: 'Updated Content' };
      notesService.updateNote.and.returnValue(updatedNote);

      component.updateTitle('Updated Title');
      component.updateContent('Updated Content');
      component.save();

      expect(notesService.updateNote).toHaveBeenCalledWith('test-id', 'Updated Title', 'Updated Content');
      expect(router.navigate).toHaveBeenCalledWith(['/note', 'test-id']);
    });

    it('should trim whitespace from title and content before saving', () => {
      const updatedNote: Note = { ...mockNote, title: 'Trimmed Title', content: 'Trimmed Content' };
      notesService.updateNote.and.returnValue(updatedNote);

      component.updateTitle('  Trimmed Title  ');
      component.updateContent('  Trimmed Content  ');
      component.save();

      expect(notesService.updateNote).toHaveBeenCalledWith('test-id', 'Trimmed Title', 'Trimmed Content');
    });

    it('should not navigate when update fails', () => {
      notesService.updateNote.and.returnValue(null);

      component.save();

      expect(notesService.updateNote).toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to note detail when canceling', () => {
      component.cancel();

      expect(router.navigate).toHaveBeenCalledWith(['/note', 'test-id']);
    });

    it('should navigate to home when goBack is called', () => {
      component.goBack();

      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('when creating new note', () => {
    beforeEach(() => {
      hostComponent.noteId = 'new';
      notesService.getNoteById.and.returnValue(undefined);
      Object.defineProperty(router, 'url', {
        get: () => '/note/new',
        configurable: true,
      });
      fixture.detectChanges();
    });

    it('should initialize with empty title and content', () => {
      expect(component.title()).toBe('');
      expect(component.content()).toBe('');
    });

    it('should not have a valid note', () => {
      expect(component.note()).toBeNull();
    });

    it('should determine it is a new note', () => {
      expect(component.isNewNote()).toBe(true);
    });

    it('should create new note', () => {
      const newNote: Note = {
        id: 'new-id',
        title: 'New Title',
        content: 'New Content',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      notesService.createNote.and.returnValue(newNote);

      component.updateTitle('New Title');
      component.updateContent('New Content');
      component.save();

      expect(notesService.createNote).toHaveBeenCalledWith('New Title', 'New Content');
      expect(notesService.updateNote).not.toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should navigate to home when canceling', () => {
      component.cancel();

      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('when note does not exist for existing id', () => {
    beforeEach(async () => {
      notesService.getNoteById.and.returnValue(undefined);
      Object.defineProperty(router, 'url', {
        get: () => '/note/test-id',
        configurable: true,
      });
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should navigate to home', () => {
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
