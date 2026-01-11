# 🎯 Task Tracker MFE - Complete Implementation Plan
**Date:** January 10, 2026  
**Priority:** ⭐⭐⭐ HIGH (Next to build!)  
**Purpose:** Personal habit/task tracker with browser notifications

---

## 📋 **OVERVIEW**

### **What is it?**
A micro-frontend for tracking personal tasks/habits with reminders and browser notifications.

### **User's Use Case:**
- Track protein intake (30g morning, evening, night)
- Track water intake
- Track any recurring task/habit
- Get browser notifications as reminders

### **Why This MFE?**
1. ✅ **Perfect for NGRX** - Complex state management
2. ✅ **Angular Reactive Forms** - Learn advanced forms
3. ✅ **Browser Notifications** - New skill
4. ✅ **Service Workers** - Background notifications
5. ✅ **Real usefulness** - User will actually use it!

---

## 🎯 **FEATURES**

### **Core Features:**
1. **Task Management**
   - Create task (name, description, frequency)
   - Edit task
   - Delete task
   - Mark as complete
   - View task history

2. **Frequency Options**
   - Hourly (e.g., every 2 hours)
   - Daily (specific times: 9 AM, 2 PM, 8 PM)
   - Weekly (specific days + times)
   - Monthly (specific dates + times)
   - Custom (flexible scheduling)

3. **Notifications**
   - Browser notifications at scheduled times
   - Notification sound (optional)
   - Snooze functionality
   - Notification history

4. **Task Types**
   - Single task (e.g., "Drink water")
   - Multi-instance task (e.g., "Protein 30g" → 3 instances: morning, evening, night)
   - Recurring vs one-time

5. **Statistics**
   - Completion rate
   - Streak tracking
   - Weekly/monthly summary
   - Charts (optional)

---

## 🏗️ **TECHNICAL ARCHITECTURE**

### **Tech Stack:**
- **Framework:** Angular 19 (standalone components)
- **State Management:** NGRX (Store, Actions, Reducers, Effects, Selectors)
- **Forms:** Angular Reactive Forms
- **Storage:** IndexedDB (Dexie.js)
- **Notifications:** Browser Notifications API + Service Worker
- **Module Federation:** @angular-architects/native-federation
- **Styling:** SCSS + CSS Grid
- **Build:** Vite + esbuild
- **Deployment:** Netlify

### **Port:** 4207

---

## 📁 **PROJECT STRUCTURE**

```
fitlog-task-tracker/
├── src/
│   ├── app/
│   │   ├── features/
│   │   │   └── tasks/
│   │   │       ├── tasks.component.ts           # Main component
│   │   │       ├── tasks.component.html
│   │   │       ├── tasks.component.scss
│   │   │       ├── components/
│   │   │       │   ├── task-list/              # Task list view
│   │   │       │   ├── task-form/              # Add/Edit form
│   │   │       │   ├── task-item/              # Single task card
│   │   │       │   ├── frequency-selector/     # Frequency picker
│   │   │       │   └── task-stats/             # Statistics view
│   │   │       └── models/
│   │   │           └── task.model.ts
│   │   │
│   │   ├── store/
│   │   │   ├── actions/
│   │   │   │   └── task.actions.ts
│   │   │   ├── reducers/
│   │   │   │   └── task.reducer.ts
│   │   │   ├── effects/
│   │   │   │   └── task.effects.ts
│   │   │   ├── selectors/
│   │   │   │   └── task.selectors.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── core/
│   │   │   └── services/
│   │   │       ├── storage.service.ts          # IndexedDB wrapper
│   │   │       ├── notification.service.ts     # Browser notifications
│   │   │       └── scheduler.service.ts        # Task scheduling
│   │   │
│   │   └── shared/
│   │       └── components/
│   │           ├── time-picker/
│   │           └── frequency-picker/
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   └── main.ts
│
├── public/
│   └── manifest.json
│
├── federation.config.js
├── netlify.toml
├── package.json
└── README.md
```

---

## 📊 **DATA MODELS**

### **Task Model:**
```typescript
export interface Task {
  id: string;                    // UUID
  name: string;                  // "Drink water", "Protein 30g"
  description?: string;          // Optional details
  frequency: TaskFrequency;      // How often
  instances: TaskInstance[];     // Multiple instances (e.g., morning, evening, night)
  notificationEnabled: boolean;  // Enable/disable notifications
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;             // Active or archived
}

export interface TaskFrequency {
  type: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';
  interval?: number;             // For hourly (e.g., every 2 hours)
  times?: string[];              // For daily (e.g., ['09:00', '14:00', '20:00'])
  days?: number[];               // For weekly (0-6, Sunday-Saturday)
  dates?: number[];              // For monthly (1-31)
  customSchedule?: string;       // Cron-like expression (future)
}

export interface TaskInstance {
  id: string;                    // UUID
  taskId: string;                // Parent task ID
  label: string;                 // "Morning", "Evening", "Night"
  scheduledTime: string;         // "09:00"
  completions: TaskCompletion[]; // History
}

export interface TaskCompletion {
  id: string;
  taskInstanceId: string;
  completedAt: Date;
  scheduledFor: Date;
  wasOnTime: boolean;            // Completed within time window
}

export interface TaskNotification {
  id: string;
  taskInstanceId: string;
  scheduledFor: Date;
  sent: boolean;
  snoozedUntil?: Date;
}
```

---

## 🔧 **NGRX IMPLEMENTATION**

### **1. Actions (`task.actions.ts`):**
```typescript
import { createAction, props } from '@ngrx/store';
import { Task, TaskInstance, TaskCompletion } from '../models/task.model';

// Task CRUD
export const loadTasks = createAction('[Task] Load Tasks');
export const loadTasksSuccess = createAction('[Task] Load Tasks Success', props<{ tasks: Task[] }>());
export const loadTasksFailure = createAction('[Task] Load Tasks Failure', props<{ error: any }>());

export const addTask = createAction('[Task] Add Task', props<{ task: Task }>());
export const addTaskSuccess = createAction('[Task] Add Task Success', props<{ task: Task }>());
export const addTaskFailure = createAction('[Task] Add Task Failure', props<{ error: any }>());

export const updateTask = createAction('[Task] Update Task', props<{ task: Task }>());
export const updateTaskSuccess = createAction('[Task] Update Task Success', props<{ task: Task }>());

export const deleteTask = createAction('[Task] Delete Task', props<{ id: string }>());
export const deleteTaskSuccess = createAction('[Task] Delete Task Success', props<{ id: string }>());

// Task Completion
export const completeTaskInstance = createAction('[Task] Complete Instance', props<{ instanceId: string }>());
export const completeTaskInstanceSuccess = createAction('[Task] Complete Instance Success', props<{ completion: TaskCompletion }>());

// Notifications
export const scheduleNotifications = createAction('[Task] Schedule Notifications', props<{ taskId: string }>());
export const sendNotification = createAction('[Task] Send Notification', props<{ instanceId: string }>());
export const snoozeNotification = createAction('[Task] Snooze Notification', props<{ instanceId: string, minutes: number }>());
```

### **2. Reducer (`task.reducer.ts`):**
```typescript
import { createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Task } from '../models/task.model';
import * as TaskActions from '../actions/task.actions';

export interface TaskState extends EntityState<Task> {
  loading: boolean;
  error: any;
  selectedTaskId: string | null;
}

export const adapter: EntityAdapter<Task> = createEntityAdapter<Task>({
  selectId: (task: Task) => task.id,
  sortComparer: (a: Task, b: Task) => a.createdAt.getTime() - b.createdAt.getTime()
});

export const initialState: TaskState = adapter.getInitialState({
  loading: false,
  error: null,
  selectedTaskId: null
});

export const taskReducer = createReducer(
  initialState,
  on(TaskActions.loadTasks, state => ({ ...state, loading: true })),
  on(TaskActions.loadTasksSuccess, (state, { tasks }) => 
    adapter.setAll(tasks, { ...state, loading: false })
  ),
  on(TaskActions.loadTasksFailure, (state, { error }) => 
    ({ ...state, loading: false, error })
  ),
  on(TaskActions.addTaskSuccess, (state, { task }) => 
    adapter.addOne(task, state)
  ),
  on(TaskActions.updateTaskSuccess, (state, { task }) => 
    adapter.updateOne({ id: task.id, changes: task }, state)
  ),
  on(TaskActions.deleteTaskSuccess, (state, { id }) => 
    adapter.removeOne(id, state)
  )
);
```

### **3. Effects (`task.effects.ts`):**
```typescript
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import * as TaskActions from '../actions/task.actions';
import { StorageService } from '../../core/services/storage.service';
import { NotificationService } from '../../core/services/notification.service';

@Injectable()
export class TaskEffects {
  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.loadTasks),
      switchMap(() =>
        this.storage.getTasks().pipe(
          map(tasks => TaskActions.loadTasksSuccess({ tasks })),
          catchError(error => of(TaskActions.loadTasksFailure({ error })))
        )
      )
    )
  );

  addTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.addTask),
      switchMap(({ task }) =>
        this.storage.addTask(task).pipe(
          map(() => TaskActions.addTaskSuccess({ task })),
          catchError(error => of(TaskActions.addTaskFailure({ error })))
        )
      )
    )
  );

  scheduleNotifications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.addTaskSuccess, TaskActions.updateTaskSuccess),
      tap(({ task }) => {
        if (task.notificationEnabled) {
          this.notificationService.scheduleNotifications(task);
        }
      })
    ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private storage: StorageService,
    private notificationService: NotificationService
  ) {}
}
```

### **4. Selectors (`task.selectors.ts`):**
```typescript
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TaskState, adapter } from '../reducers/task.reducer';

export const selectTaskState = createFeatureSelector<TaskState>('tasks');

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal
} = adapter.getSelectors(selectTaskState);

export const selectAllTasks = selectAll;
export const selectTaskEntities = selectEntities;
export const selectTasksLoading = createSelector(
  selectTaskState,
  state => state.loading
);

export const selectActiveTasks = createSelector(
  selectAllTasks,
  tasks => tasks.filter(task => task.isActive)
);

export const selectTaskById = (id: string) => createSelector(
  selectTaskEntities,
  entities => entities[id]
);

export const selectTodaysTasks = createSelector(
  selectActiveTasks,
  tasks => {
    const today = new Date().toDateString();
    return tasks.filter(task => {
      // Filter tasks scheduled for today
      return task.instances.some(instance => 
        isScheduledForToday(instance, today)
      );
    });
  }
);
```

---

## 🔔 **BROWSER NOTIFICATIONS**

### **Notification Service:**
```typescript
import { Injectable } from '@angular/core';
import { Task, TaskInstance } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private permission: NotificationPermission = 'default';

  constructor() {
    this.checkPermission();
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.error('Browser does not support notifications');
      return false;
    }

    this.permission = await Notification.requestPermission();
    return this.permission === 'granted';
  }

  private checkPermission(): void {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async scheduleNotifications(task: Task): Promise<void> {
    if (this.permission !== 'granted') {
      await this.requestPermission();
    }

    // Schedule notifications for each instance
    task.instances.forEach(instance => {
      this.scheduleInstanceNotification(task, instance);
    });
  }

  private scheduleInstanceNotification(task: Task, instance: TaskInstance): void {
    const scheduledTime = this.calculateNextScheduledTime(instance);
    const delay = scheduledTime.getTime() - Date.now();

    if (delay > 0) {
      setTimeout(() => {
        this.showNotification(task, instance);
      }, delay);
    }
  }

  private showNotification(task: Task, instance: TaskInstance): void {
    if (this.permission === 'granted') {
      const notification = new Notification(task.name, {
        body: `Time for: ${instance.label}`,
        icon: '/assets/icons/task-icon.png',
        badge: '/assets/icons/badge.png',
        tag: instance.id,
        requireInteraction: true,
        actions: [
          { action: 'complete', title: 'Mark Complete' },
          { action: 'snooze', title: 'Snooze 10 min' }
        ]
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }

  private calculateNextScheduledTime(instance: TaskInstance): Date {
    // Calculate next scheduled time based on frequency
    // Implementation depends on frequency type
    const now = new Date();
    const [hours, minutes] = instance.scheduledTime.split(':').map(Number);
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);

    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  }
}
```

### **Service Worker Integration:**
For background notifications, add to `public/sw.js`:
```javascript
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'complete') {
    // Send message to app to mark task complete
    clients.openWindow('/tasks?action=complete&id=' + event.notification.tag);
  } else if (event.action === 'snooze') {
    // Reschedule notification
    clients.openWindow('/tasks?action=snooze&id=' + event.notification.tag);
  } else {
    // Open app
    clients.openWindow('/tasks');
  }
});
```

---

## 🎨 **UI COMPONENTS**

### **1. Task List Component:**
```typescript
@Component({
  selector: 'app-task-list',
  template: `
    <div class="task-list">
      <div class="task-list-header">
        <h2>My Tasks</h2>
        <button (click)="openAddTaskForm()">+ Add Task</button>
      </div>

      <div class="task-filters">
        <button [class.active]="filter === 'all'" (click)="setFilter('all')">All</button>
        <button [class.active]="filter === 'today'" (click)="setFilter('today')">Today</button>
        <button [class.active]="filter === 'active'" (click)="setFilter('active')">Active</button>
      </div>

      <div class="tasks">
        <app-task-item 
          *ngFor="let task of filteredTasks$ | async"
          [task]="task"
          (complete)="onComplete($event)"
          (edit)="onEdit($event)"
          (delete)="onDelete($event)">
        </app-task-item>
      </div>
    </div>
  `
})
export class TaskListComponent {
  tasks$ = this.store.select(selectAllTasks);
  filteredTasks$!: Observable<Task[]>;
  filter: 'all' | 'today' | 'active' = 'all';

  constructor(private store: Store) {
    this.updateFilter();
  }

  setFilter(filter: 'all' | 'today' | 'active'): void {
    this.filter = filter;
    this.updateFilter();
  }

  private updateFilter(): void {
    switch (this.filter) {
      case 'today':
        this.filteredTasks$ = this.store.select(selectTodaysTasks);
        break;
      case 'active':
        this.filteredTasks$ = this.store.select(selectActiveTasks);
        break;
      default:
        this.filteredTasks$ = this.tasks$;
    }
  }

  openAddTaskForm(): void {
    // Open modal or navigate to form
  }

  onComplete(instanceId: string): void {
    this.store.dispatch(TaskActions.completeTaskInstance({ instanceId }));
  }

  onEdit(task: Task): void {
    // Open edit form
  }

  onDelete(taskId: string): void {
    this.store.dispatch(TaskActions.deleteTask({ id: taskId }));
  }
}
```

### **2. Task Form Component:**
```typescript
@Component({
  selector: 'app-task-form',
  template: `
    <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label>Task Name</label>
        <input formControlName="name" placeholder="e.g., Drink water">
      </div>

      <div class="form-group">
        <label>Description (optional)</label>
        <textarea formControlName="description"></textarea>
      </div>

      <div class="form-group">
        <label>Frequency</label>
        <app-frequency-selector formControlName="frequency"></app-frequency-selector>
      </div>

      <div class="form-group">
        <label>Instances</label>
        <div formArrayName="instances">
          <div *ngFor="let instance of instances.controls; let i = index" [formGroupName]="i">
            <input formControlName="label" placeholder="e.g., Morning">
            <input type="time" formControlName="scheduledTime">
            <button type="button" (click)="removeInstance(i)">Remove</button>
          </div>
        </div>
        <button type="button" (click)="addInstance()">+ Add Instance</button>
      </div>

      <div class="form-group">
        <label>
          <input type="checkbox" formControlName="notificationEnabled">
          Enable Notifications
        </label>
      </div>

      <div class="form-actions">
        <button type="submit" [disabled]="!taskForm.valid">Save Task</button>
        <button type="button" (click)="onCancel()">Cancel</button>
      </div>
    </form>
  `
})
export class TaskFormComponent implements OnInit {
  taskForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      frequency: [null, Validators.required],
      instances: this.fb.array([this.createInstance()]),
      notificationEnabled: [true]
    });
  }

  get instances(): FormArray {
    return this.taskForm.get('instances') as FormArray;
  }

  createInstance(): FormGroup {
    return this.fb.group({
      label: ['', Validators.required],
      scheduledTime: ['', Validators.required]
    });
  }

  addInstance(): void {
    this.instances.push(this.createInstance());
  }

  removeInstance(index: number): void {
    this.instances.removeAt(index);
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const task: Task = {
        id: crypto.randomUUID(),
        ...this.taskForm.value,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };

      this.store.dispatch(TaskActions.addTask({ task }));
    }
  }

  onCancel(): void {
    // Close form
  }
}
```

---

## 📅 **IMPLEMENTATION TIMELINE**

### **Week 1: Setup & NGRX (3-4 days)**
- [ ] Create Angular app
- [ ] Install dependencies (NGRX, Dexie)
- [ ] Setup Module Federation
- [ ] Create NGRX store structure
- [ ] Implement actions, reducers, effects, selectors
- [ ] Setup Redux DevTools

### **Week 2: Core Features (4-5 days)**
- [ ] Create task models
- [ ] Implement StorageService (IndexedDB)
- [ ] Build task list component
- [ ] Build task form component
- [ ] Implement CRUD operations
- [ ] Test NGRX flow

### **Week 3: Notifications & Polish (3-4 days)**
- [ ] Implement NotificationService
- [ ] Request notification permission
- [ ] Schedule notifications
- [ ] Service Worker integration
- [ ] Test notifications
- [ ] UI polish & styling

### **Week 4: Integration & Deployment (2-3 days)**
- [ ] Integrate with Shell
- [ ] Update federation.manifest.json
- [ ] Test in Shell
- [ ] Create GitHub repo
- [ ] Deploy to Netlify
- [ ] Documentation

**Total Time: 2-3 weeks**

---

## ✅ **ACCEPTANCE CRITERIA**

### **Must Have:**
- [ ] Create task with name, frequency, instances
- [ ] Edit existing task
- [ ] Delete task
- [ ] Mark task instance as complete
- [ ] Browser notifications at scheduled times
- [ ] NGRX state management working
- [ ] IndexedDB persistence
- [ ] Responsive design
- [ ] Deployed to Netlify
- [ ] Integrated with Shell

### **Nice to Have:**
- [ ] Task statistics
- [ ] Completion streak tracking
- [ ] Snooze notifications
- [ ] Task categories/tags
- [ ] Export task history
- [ ] Dark mode

---

## 🎯 **SUCCESS METRICS**

### **Technical:**
- [ ] NGRX fully implemented and working
- [ ] Redux DevTools showing state changes
- [ ] Notifications working in browser
- [ ] Service Worker registered
- [ ] Module Federation loading correctly
- [ ] No console errors

### **User Experience:**
- [ ] Easy to add tasks
- [ ] Clear notification UI
- [ ] Fast and responsive
- [ ] Works offline
- [ ] Actually useful for user

### **Learning:**
- [ ] Understand NGRX deeply
- [ ] Master Angular Reactive Forms
- [ ] Learn Browser Notifications API
- [ ] Service Worker experience
- [ ] Can explain in interviews

---

## 📚 **DOCUMENTATION TO CREATE**

After completion:
1. **README.md** - Project overview
2. **NGRX_IMPLEMENTATION.md** - NGRX patterns used
3. **NOTIFICATIONS_GUIDE.md** - How notifications work
4. **API_DOCUMENTATION.md** - Component APIs
5. **DEPLOYMENT.md** - Deployment process

---

## 🚀 **READY TO START?**

**Say "Let's build Task Tracker" and we'll:**
1. Create the Angular app
2. Setup NGRX
3. Implement features step by step
4. Deploy to Netlify

**This will be your NGRX masterpiece!** 🎯
