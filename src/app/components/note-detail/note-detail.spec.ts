import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Note } from '../../models/note.interface';
import { ConfirmationService } from '../../services/confirmation.service';
import { NotesService } from '../../services/notes.service';
import { NoteDetailComponent } from './note-detail';

@Component({
  template: '<app-note-detail [id]="noteId" />',
  standalone: true,
  imports: [NoteDetailComponent],
})
class TestHostComponent {
  noteId = 'test-id';
}

describe('NoteDetailComponent', () => {
  let component: NoteDetailComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let notesService: jasmine.SpyObj<NotesService>;
  let router: jasmine.SpyObj<Router>;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;

  const mockNote: Note = {
    id: 'test-id',
    title: 'Test Note',
    content: 'Test content',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  beforeEach(async () => {
    const notesServiceSpy = jasmine.createSpyObj('NotesService', ['getNoteById', 'deleteNote']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const confirmationServiceSpy = jasmine.createSpyObj('ConfirmationService', ['confirmDelete']);

    await TestBed.configureTestingModule({
      imports: [NoteDetailComponent, TestHostComponent],
      providers: [
        { provide: NotesService, useValue: notesServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ConfirmationService, useValue: confirmationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    component = fixture.debugElement.children[0].componentInstance;
    notesService = TestBed.inject(NotesService) as jasmine.SpyObj<NotesService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    confirmationService = TestBed.inject(ConfirmationService) as jasmine.SpyObj<ConfirmationService>;
  });

  describe('when note exists', () => {
    beforeEach(() => {
      notesService.getNoteById.and.returnValue(mockNote);
      fixture.detectChanges();
    });

    it('should get note by id from service', () => {
      expect(notesService.getNoteById).toHaveBeenCalledWith('test-id');
      expect(component.note()).toEqual(mockNote);
    });

    it('should navigate to edit page when editNote is called', () => {
      component.editNote();

      expect(router.navigate).toHaveBeenCalledWith(['/note', 'test-id', 'edit']);
    });

    it('should navigate to home when goBack is called', () => {
      component.goBack();

      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should call window.print when printNote is called', () => {
      spyOn(window, 'print');

      component.printNote();

      expect(window.print).toHaveBeenCalled();
    });

    it('should render print button in template', () => {
      const printIcons = fixture.debugElement.queryAll(By.css('button mat-icon'));
      const printIcon = printIcons.find((icon) => icon.nativeElement.textContent.trim() === 'print');

      expect(printIcon).toBeTruthy();
    });

    it('should call printNote when print button is clicked', () => {
      spyOn(component, 'printNote');
      const printIcons = fixture.debugElement.queryAll(By.css('button mat-icon'));
      const printIconButton = printIcons.find((icon) => icon.nativeElement.textContent.trim() === 'print')?.parent;

      printIconButton?.nativeElement.click();

      expect(component.printNote).toHaveBeenCalled();
    });

    describe('delete note', () => {
      it('should delete note and navigate home when confirmed', () => {
        confirmationService.confirmDelete.and.returnValue(of(true));
        notesService.deleteNote.and.returnValue();

        component.delete();

        expect(confirmationService.confirmDelete).toHaveBeenCalledWith('Test Note');
        expect(notesService.deleteNote).toHaveBeenCalledWith('test-id');
        expect(router.navigate).toHaveBeenCalledWith(['/']);
      });

      it('should not delete note when not confirmed', () => {
        confirmationService.confirmDelete.and.returnValue(of(false));

        component.delete();

        expect(confirmationService.confirmDelete).toHaveBeenCalledWith('Test Note');
        expect(notesService.deleteNote).not.toHaveBeenCalled();
      });
    });
  });

  describe('when note does not exist', () => {
    beforeEach(async () => {
      notesService.getNoteById.and.returnValue(undefined);
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should navigate to home when note does not exist', () => {
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should navigate to home when editNote is called', () => {
      component.editNote();

      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should not delete when note does not exist', () => {
      confirmationService.confirmDelete.and.returnValue(of(true));

      component.delete();

      expect(confirmationService.confirmDelete).not.toHaveBeenCalled();
      expect(notesService.deleteNote).not.toHaveBeenCalled();
    });
  });

  describe('when id input changes', () => {
    const newMockNote: Note = {
      id: 'new-id',
      title: 'New Note',
      content: 'New content',
      createdAt: new Date('2023-02-01'),
      updatedAt: new Date('2023-02-01'),
    };

    beforeEach(() => {
      notesService.getNoteById.and.returnValue(mockNote);
      fixture.detectChanges();
    });

    it('should update note when id input changes', () => {
      expect(component.note()).toEqual(mockNote);

      notesService.getNoteById.and.returnValue(newMockNote);
      hostComponent.noteId = 'new-id';
      fixture.detectChanges();

      expect(notesService.getNoteById).toHaveBeenCalledWith('new-id');
      expect(component.note()).toEqual(newMockNote);
    });
  });
});
