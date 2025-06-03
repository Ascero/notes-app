import { Component, inject, output, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NotesService } from '../../services/notes.service';

@Component({
  selector: 'app-note-search',
  imports: [MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  templateUrl: './note-search.html',
  styleUrl: './note-search.scss',
})
export class NoteSearchComponent {
  private readonly notesService = inject(NotesService);

  public readonly searchTerm: Signal<string> = this.notesService.searchTerm;
  public readonly searchChanged = output<string>();

  public onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.notesService.setSearchTerm(value);
    this.searchChanged.emit(value);
  }

  public clearSearch(): void {
    this.notesService.setSearchTerm('');
    this.searchChanged.emit('');
  }
}
