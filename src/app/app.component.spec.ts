import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { TasksComponent } from './features/tasks/tasks.component';
import { TaskStorageService } from './services/task-storage.service';
import { NotificationService } from './services/notification.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let mockTaskStorage: any;
  let mockNotificationService: any;

  beforeEach(async () => {
    mockTaskStorage = jasmine.createSpyObj('TaskStorageService', ['getTasks']);
    mockTaskStorage.getTasks.and.returnValue(of([]));

    mockNotificationService = jasmine.createSpyObj('NotificationService', ['hasPermission']);
    mockNotificationService.hasPermission.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: TaskStorageService, useValue: mockTaskStorage },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'fitlog-tasks-2' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('fitlog-tasks-2');
  });
});
