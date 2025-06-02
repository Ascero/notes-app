import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NoteSearchComponent } from './note-search';

describe('NoteSearchComponent', () => {
  let component: NoteSearchComponent;
  let fixture: ComponentFixture<NoteSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteSearchComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(NoteSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have empty search term initially', () => {
    expect(component.searchTerm()).toBe('');
  });

  it('should update search term when input changes', () => {
    const input = fixture.nativeElement.querySelector('.search-input');
    const testValue = 'test search';

    input.value = testValue;
    input.dispatchEvent(new Event('input'));

    expect(component.searchTerm()).toBe(testValue);
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
    component.searchTerm.set('test');
    fixture.detectChanges();

    const clearButton = fixture.nativeElement.querySelector('.clear-button');
    expect(clearButton).toBeTruthy();
  });

  it('should not show clear button when search term is empty', () => {
    component.searchTerm.set('');
    fixture.detectChanges();

    const clearButton = fixture.nativeElement.querySelector('.clear-button');
    expect(clearButton).toBeFalsy();
  });

  it('should clear search term when clear button is clicked', () => {
    spyOn(component.searchChanged, 'emit');
    component.searchTerm.set('test');
    fixture.detectChanges();

    const clearButton = fixture.nativeElement.querySelector('.clear-button');
    clearButton.click();

    expect(component.searchTerm()).toBe('');
    expect(component.searchChanged.emit).toHaveBeenCalledWith('');
  });
});
