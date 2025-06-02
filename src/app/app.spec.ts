import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ChildrenOutletContexts } from '@angular/router';
import { AppComponent } from './app';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let childrenOutletContexts: jasmine.SpyObj<ChildrenOutletContexts>;

  beforeEach(async () => {
    const contextsSpy = jasmine.createSpyObj('ChildrenOutletContexts', ['getContext']);

    await TestBed.configureTestingModule({
      imports: [AppComponent, NoopAnimationsModule],
      providers: [{ provide: ChildrenOutletContexts, useValue: contextsSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    childrenOutletContexts = TestBed.inject(ChildrenOutletContexts) as jasmine.SpyObj<ChildrenOutletContexts>;

    childrenOutletContexts.getContext.and.returnValue(null);
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  describe('getRouteAnimationData', () => {
    it('should return animation data when route context exists', () => {
      const mockContext = {
        route: {
          snapshot: {
            data: { animation: 'slideIn' },
          },
        },
      };

      (childrenOutletContexts.getContext as jasmine.Spy).and.returnValue(mockContext);

      const result = component.getRouteAnimationData();

      expect(childrenOutletContexts.getContext).toHaveBeenCalledWith('primary');
      expect(result).toBe('slideIn');
    });

    it('should return undefined when no route context exists', () => {
      (childrenOutletContexts.getContext as jasmine.Spy).and.returnValue(null);

      const result = component.getRouteAnimationData();

      expect(childrenOutletContexts.getContext).toHaveBeenCalledWith('primary');
      expect(result).toBeUndefined();
    });

    it('should return undefined when route has no animation data', () => {
      const mockContext = {
        route: {
          snapshot: {
            data: {},
          },
        },
      };

      (childrenOutletContexts.getContext as jasmine.Spy).and.returnValue(mockContext);

      const result = component.getRouteAnimationData();

      expect(result).toBeUndefined();
    });
  });
});
