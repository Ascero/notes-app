import { Component, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-note-search',
  imports: [MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  templateUrl: './note-search.html',
  styleUrl: './note-search.scss',
})
export class NoteSearchComponent {
  public readonly searchTerm = signal<string>('');
  public readonly searchChanged = output<string>();

  public onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.searchTerm.set(value);
    this.searchChanged.emit(value);
  }

  public clearSearch(): void {
    this.searchTerm.set('');
    this.searchChanged.emit('');
  }
}
