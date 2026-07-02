import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { EnhancedTaskTrackerComponent } from './enhanced-task-tracker.component';
import { TaskStorageService } from '../../services/task-storage.service';
import { NotificationService } from '../../services/notification.service';
import { Task } from '../../models/task.model';

describe('EnhancedTaskTrackerComponent', () => {
  let component: EnhancedTaskTrackerComponent;
  let fixture: ComponentFixture<EnhancedTaskTrackerComponent>;
  let mockTaskStorage: jasmine.SpyObj<TaskStorageService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  const dummyTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Water Plants',
      description: 'Water garden outside',
      completed: false,
      priority: 'low',
      recurrence: 'none',
      dueDate: new Date('2026-07-02T12:00:00Z'),
      completionCount: 0,
      archived: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'task-2',
      title: 'Drink Water',
      description: 'Stay hydrated',
      completed: true,
      priority: 'high',
      recurrence: 'hourly',
      dueDate: new Date('2026-07-02T11:00:00Z'),
      nextDueDate: new Date('2026-07-02T12:00:00Z'),
      completionCount: 1,
      archived: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  beforeEach(async () => {
    mockTaskStorage = jasmine.createSpyObj('TaskStorageService', ['getTasks', 'addTask', 'updateTask', 'deleteTask']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'hasPermission', 
      'requestPermission', 
      'showNotification', 
      'notifyTaskDue', 
      'notifyTaskReset'
    ]);

    // Setup default service return values
    mockTaskStorage.getTasks.and.callFake(() => of(JSON.parse(JSON.stringify(dummyTasks))));
    mockTaskStorage.addTask.and.returnValue(of(dummyTasks[0]));
    mockTaskStorage.updateTask.and.returnValue(of(undefined));
    mockTaskStorage.deleteTask.and.returnValue(of(undefined));

    mockNotificationService.hasPermission.and.returnValue(false);
    mockNotificationService.requestPermission.and.returnValue(Promise.resolve(false));

    await TestBed.configureTestingModule({
      imports: [FormsModule, EnhancedTaskTrackerComponent],
      providers: [
        { provide: TaskStorageService, useValue: mockTaskStorage },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EnhancedTaskTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load tasks from IndexedDB on initialization', () => {
    expect(mockTaskStorage.getTasks).toHaveBeenCalled();
    expect(component.tasks.length).toBe(2);
    expect(component.tasks[0].title).toBe('Water Plants');
  });

  it('should calculate next due date correctly for hourly schedule', () => {
    const fromDate = new Date('2026-07-02T10:00:00Z');
    const nextDate = component.calculateNextDueDate('hourly', fromDate);
    
    expect(nextDate.getHours()).toBe(fromDate.getHours() + 1);
  });

  it('should calculate next due date correctly for 2-minute schedule', () => {
    const fromDate = new Date('2026-07-02T10:00:00Z');
    const nextDate = component.calculateNextDueDate('2min', fromDate);
    
    expect(nextDate.getMinutes()).toBe(fromDate.getMinutes() + 2);
  });

  it('should show local toast alert and browser notification when a new task is saved', fakeAsync(() => {
    // Arrange
    component.formData = {
      title: 'New Activity',
      description: 'Testing saveTask',
      priority: 'high',
      recurrence: 'none',
      dueDate: '2026-07-02T13:00'
    };
    component.editingTask = null;
    component.notificationsEnabled = true;

    const savedTask: Task = {
      id: 'task-new',
      title: 'New Activity',
      description: 'Testing saveTask',
      completed: false,
      priority: 'high',
      recurrence: 'none',
      dueDate: new Date('2026-07-02T13:00:00Z'),
      completionCount: 0,
      archived: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockTaskStorage.addTask.and.returnValue(of(savedTask));

    // Act
    component.saveTask();
    tick();

    // Assert
    expect(mockTaskStorage.addTask).toHaveBeenCalled();
    expect(component.tasks[0].title).toBe('New Activity');
    expect(component.activeToasts.length).toBe(1);
    expect(component.activeToasts[0].title).toBe('Task Created! ✅');
    expect(mockNotificationService.showNotification).toHaveBeenCalledWith('Task Created! ✅', jasmine.any(Object));
  }));

  it('should toggle task completion status and reset notifiedOfDue flag', () => {
    // Arrange
    const targetTask = component.tasks[0]; // Water Plants (completed: false)
    expect(targetTask.completed).toBeFalse();

    // Act
    component.toggleComplete(targetTask.id);

    // Assert
    expect(targetTask.completed).toBeTrue();
    expect(targetTask.notifiedOfDue).toBeFalse();
    expect(mockTaskStorage.updateTask).toHaveBeenCalledWith(targetTask);
  });
});
