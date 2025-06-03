import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { Note } from '../../models/note.interface';
import { NotesService } from '../../services/notes.service';
import { NotesListComponent } from './notes-list';

describe('NotesListComponent', () => {
  let component: NotesListComponent;
  let fixture: ComponentFixture<NotesListComponent>;
  let notesService: jasmine.SpyObj<NotesService>;
  let router: jasmine.SpyObj<Router>;
  let mockNotes: Note[];
  let notesSignal: WritableSignal<Note[]>;
  let filteredNotesSignal: WritableSignal<Note[]>;

  beforeEach(async () => {
    mockNotes = [
      {
        id: 'note-1',
        title: 'First Note',
        content: 'Content of first note',
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        updatedAt: new Date('2023-01-01T00:00:00.000Z'),
      },
      {
        id: 'note-2',
        title: 'Second Note',
        content:
          'Content of second note with a very long text that should be truncated when displayed in the preview because it exceeds the limit',
        createdAt: new Date('2023-01-02T00:00:00.000Z'),
        updatedAt: new Date('2023-01-02T00:00:00.000Z'),
      },
      {
        id: 'note-3',
        title: '',
        content: 'Note without title',
        createdAt: new Date('2023-01-03T00:00:00.000Z'),
        updatedAt: new Date('2023-01-03T00:00:00.000Z'),
      },
    ];

    notesSignal = signal(mockNotes);
    filteredNotesSignal = signal(mockNotes);

    const notesServiceSpy = jasmine.createSpyObj('NotesService', ['deleteNote', 'setSearchTerm', 'setSortOrder'], {
      notes: notesSignal,
      filteredNotes: filteredNotesSignal,
      sortOrder: signal('newest'),
      searchTerm: signal(''),
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [NotesListComponent, NoopAnimationsModule],
      providers: [
        { provide: NotesService, useValue: notesServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotesListComponent);
    component = fixture.componentInstance;
    notesService = TestBed.inject(NotesService) as jasmine.SpyObj<NotesService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should display notes from service', () => {
    fixture.detectChanges();

    expect(component.notes()).toEqual(mockNotes);
  });

  it('should navigate to new note when createNote is called', () => {
    component.navigateToNoteCreation();

    expect(router.navigate).toHaveBeenCalledWith(['/note/new']);
  });

  it('should navigate to note detail when viewNote is called', () => {
    component.navigateToNote('note-1');

    expect(router.navigate).toHaveBeenCalledWith(['/note', 'note-1']);
  });

  describe('when deleting a note', () => {
    let mockEvent: jasmine.SpyObj<Event>;

    beforeEach(() => {
      mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
    });

    it('should delete note when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);

      component.deleteNote(mockEvent, 'note-1');

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this note?');
      expect(notesService.deleteNote).toHaveBeenCalledWith('note-1');
    });

    it('should not delete note when not confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteNote(mockEvent, 'note-1');

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this note?');
      expect(notesService.deleteNote).not.toHaveBeenCalled();
    });

    it('should stop event propagation', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteNote(mockEvent, 'note-1');

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('when rendering the template', () => {
    let compiled: HTMLElement;

    beforeEach(() => {
      fixture.detectChanges();

      compiled = fixture.nativeElement;
    });

    it('should display all notes', () => {
      const noteCards = compiled.querySelectorAll('.note-card');

      expect(noteCards.length).toBe(3);
    });

    it('should display note titles correctly', () => {
      const titles = compiled.querySelectorAll('mat-card-title');

      expect(titles[0].textContent?.trim()).toBe('First Note');
      expect(titles[1].textContent?.trim()).toBe('Second Note');
      expect(titles[2].textContent?.trim()).toBe('Untitled');
    });

    it('should display formatted dates', () => {
      const subtitles = compiled.querySelectorAll('mat-card-subtitle');

      expect(subtitles[0].textContent?.trim()).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
      expect(subtitles[1].textContent?.trim()).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
      expect(subtitles[2].textContent?.trim()).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
    });

    it('should truncate long content with ellipsis', () => {
      const previews = compiled.querySelectorAll('.note-preview');

      expect(previews[1].textContent?.trim()).toContain('...');
    });

    it('should not add ellipsis to short content', () => {
      const previews = compiled.querySelectorAll('.note-preview');

      expect(previews[0].textContent?.trim()).not.toContain('...');
    });

    it('should display delete buttons for all notes', () => {
      const deleteButtons = compiled.querySelectorAll('button[color="warn"]');

      expect(deleteButtons.length).toBe(3);
    });

    it('should display add note button', () => {
      const addButton = compiled.querySelector('.add-note-button');

      expect(addButton).toBeTruthy();
    });
  });

  describe('when searching', () => {
    it('should call setSearchTerm when search changes', () => {
      const searchTerm = 'test search';

      component.onSearchChanged(searchTerm);

      expect(notesService.setSearchTerm).toHaveBeenCalledWith(searchTerm);
    });

    it('should display filtered notes when search is applied', () => {
      const filteredNotes = [mockNotes[0]];
      filteredNotesSignal.set(filteredNotes);

      fixture.detectChanges();

      expect(component.notes()).toEqual(filteredNotes);
    });

    it('should update displayed notes when search results change', () => {
      fixture.detectChanges();
      let noteCards = fixture.nativeElement.querySelectorAll('.note-card');
      expect(noteCards.length).toBe(3);

      filteredNotesSignal.set([mockNotes[0], mockNotes[1]]);
      fixture.detectChanges();

      noteCards = fixture.nativeElement.querySelectorAll('.note-card');
      expect(noteCards.length).toBe(2);
    });

    it('should show no notes when search yields empty results', () => {
      filteredNotesSignal.set([]);
      fixture.detectChanges();

      const noteCards = fixture.nativeElement.querySelectorAll('.note-card');
      expect(noteCards.length).toBe(0);
    });

    it('should render note search component', () => {
      fixture.detectChanges();

      const searchComponent = fixture.nativeElement.querySelector('app-note-search');
      expect(searchComponent).toBeTruthy();
    });
  });

  describe('when sorting', () => {
    it('should call setSortOrder when sort order changes', () => {
      component.onSortOrderChanged('oldest');

      expect(notesService.setSortOrder).toHaveBeenCalledWith('oldest');
    });

    it('should expose sortOrder signal from service', () => {
      expect(component.sortOrder()).toBe('newest');
    });
  });
});
