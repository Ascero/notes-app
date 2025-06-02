import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/notes-list/notes-list').then((m) => m.NotesListComponent),
    data: { animation: 'list' },
  },
  {
    path: 'note/:id',
    loadComponent: () => import('./components/note-detail/note-detail').then((m) => m.NoteDetailComponent),
    data: { animation: 'detail' },
  },
  { path: '**', redirectTo: '' },
];
