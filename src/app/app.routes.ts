import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/notes-list/notes-list').then((m) => m.NotesListComponent),
    data: { animation: 'list' },
  },
  { path: '**', redirectTo: '' },
];
