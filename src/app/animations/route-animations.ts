import { animate, group, query, style, transition, trigger } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  transition('list => detail', [
    style({ position: 'relative', overflow: 'hidden', height: '100vh' }),
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'auto',
        }),
      ],
      { optional: true }
    ),
    query(':enter', [style({ transform: 'translateY(100%)', opacity: 0 })], { optional: true }),
    query(':leave', [style({ transform: 'translateY(0%)', opacity: 1 })], { optional: true }),
    group([
      query(':leave', [animate('300ms ease-in-out', style({ transform: 'translateY(-5%)', opacity: 0 }))], {
        optional: true,
      }),
      query(':enter', [animate('350ms ease-out', style({ transform: 'translateY(0%)', opacity: 1 }))], {
        optional: true,
      }),
    ]),
  ]),
  transition('detail => list', [
    style({ position: 'relative', overflow: 'hidden', height: '100vh' }),
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'auto',
        }),
      ],
      { optional: true }
    ),
    query(':enter', [style({ transform: 'translateY(-5%)', opacity: 0 })], { optional: true }),
    query(':leave', [style({ transform: 'translateY(0%)', opacity: 1 })], { optional: true }),
    group([
      query(':leave', [animate('300ms ease-in-out', style({ transform: 'translateY(100%)', opacity: 0 }))], {
        optional: true,
      }),
      query(':enter', [animate('350ms ease-out', style({ transform: 'translateY(0%)', opacity: 1 }))], {
        optional: true,
      }),
    ]),
  ]),
]);
