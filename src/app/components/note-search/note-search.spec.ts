import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NotesService } from '../../services/notes.service';
import { NoteSearchComponent } from './note-search';

describe('NoteSearchComponent', () => {
  let component: NoteSearchComponent;
  let fixture: ComponentFixture<NoteSearchComponent>;
  let notesService: jasmine.SpyObj<NotesService>;

  beforeEach(async () => {
    const notesServiceSpy = jasmine.createSpyObj('NotesService', ['setSearchTerm'], {
      searchTerm: jasmine.createSpy().and.returnValue(''),
    });

    await TestBed.configureTestingModule({
      imports: [NoteSearchComponent, NoopAnimationsModule],
      providers: [{ provide: NotesService, useValue: notesServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(NoteSearchComponent);
    component = fixture.componentInstance;
    notesService = TestBed.inject(NotesService) as jasmine.SpyObj<NotesService>;
    fixture.detectChanges();
  });

  it('should have empty search term initially', () => {
    expect(component.searchTerm()).toBe('');
  });

  it('should call notesService.setSearchTerm when input changes', () => {
    const input = fixture.nativeElement.querySelector('.search-input');
    const testValue = 'test search';

    input.value = testValue;
    input.dispatchEvent(new Event('input'));

    expect(notesService.setSearchTerm).toHaveBeenCalledWith(testValue);
  });

  it('should emit search term when input changes', () => {
    spyOn(component.searchChanged, 'emit');
    const input = fixture.nativeElement.querySelector('.search-input');
    const testValue = 'test search';

    input.value = testValue;
    input.dispatchEvent(new Event('input'));

    expect(component.searchChanged.emit).toHaveBeenCalledWith(testValue);
  });

  it('should show clear button when search term is not empty', () => {
    (notesService.searchTerm as jasmine.Spy).and.returnValue('test');
    fixture.detectChanges();

    const clearButton = fixture.nativeElement.querySelector('.clear-button');
    expect(clearButton).toBeTruthy();
  });

  it('should not show clear button when search term is empty', () => {
    (notesService.searchTerm as jasmine.Spy).and.returnValue('');
    fixture.detectChanges();

    const clearButton = fixture.nativeElement.querySelector('.clear-button');
    expect(clearButton).toBeFalsy();
  });

  it('should call notesService.setSearchTerm with empty string when clear button is clicked', () => {
    spyOn(component.searchChanged, 'emit');
    (notesService.searchTerm as jasmine.Spy).and.returnValue('test');
    fixture.detectChanges();

    const clearButton = fixture.nativeElement.querySelector('.clear-button');
    clearButton.click();

    expect(notesService.setSearchTerm).toHaveBeenCalledWith('');
    expect(component.searchChanged.emit).toHaveBeenCalledWith('');
  });
});
