import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/notes-list/notes-list').then((m) => m.NotesListComponent),
    data: { animation: 'list' },
  },
  {
    path: 'note/new',
    loadComponent: () => import('./components/note-edit/note-edit').then((m) => m.NoteEditComponent),
    data: { animation: 'edit' },
  },
  {
    path: 'note/:id/edit',
    loadComponent: () => import('./components/note-edit/note-edit').then((m) => m.NoteEditComponent),
    data: { animation: 'edit' },
  },
  {
    path: 'note/:id',
    loadComponent: () => import('./components/note-detail/note-detail').then((m) => m.NoteDetailComponent),
    data: { animation: 'detail' },
  },
  { path: '**', redirectTo: '' },
];
