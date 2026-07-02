import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { TaskStorageService } from '../../services/task-storage.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-enhanced-task-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enhanced-task-tracker.component.html',
  styleUrls: ['./enhanced-task-tracker.component.scss']
})
export class EnhancedTaskTrackerComponent implements OnInit, OnDestroy {
  private worker?: Worker;
  private checkInterval?: number;
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  paginatedTasks: Task[] = [];
  showAddForm = false;
  showArchived = false;
  editingTask: Task | null = null;
  
  formData = {
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    recurrence: 'none' as 'none' | '2min' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly',
    dueDate: ''
  };

  filterStatus = 'all';
  filterPriority = '';
  filterRecurrence = '';
  searchTerm = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  Math = Math;
  notificationsEnabled = false;
  activeToasts: { id: string; title: string; message: string; type: 'success' | 'info' | 'warning' }[] = [];

  showLocalToast(title: string, message: string, type: 'success' | 'info' | 'warning' = 'info') {
    const id = Math.random().toString(36).substring(2, 9);
    this.activeToasts.push({ id, title, message, type });
    setTimeout(() => {
      this.activeToasts = this.activeToasts.filter(t => t.id !== id);
    }, 4000);
  }

  removeToast(id: string) {
    this.activeToasts = this.activeToasts.filter(t => t.id !== id);
  }

  constructor(
    private notificationService: NotificationService,
    private taskStorage: TaskStorageService
  ) {}

  ngOnInit() {
    this.loadTasks();
    this.checkRecurringTasks();
    this.applyFilter();
    this.initializeWorker();
    this.checkNotificationPermission();
    
    // Fallback: Check recurring tasks every minute if worker fails
    this.checkInterval = window.setInterval(() => this.checkRecurringTasks(), 60000);
  }

  get activeTasks() {
    return this.tasks.filter(t => !t.completed && !t.archived);
  }

  get completedToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.tasks.filter(t => {
      if (!t.lastCompleted) return false;
      const completedDate = new Date(t.lastCompleted);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === today.getTime();
    }).length;
  }

  get recurringTasks() {
    return this.tasks.filter(t => t.recurrence !== 'none' && !t.archived);
  }

  get archivedTasks() {
    return this.tasks.filter(t => t.archived);
  }

  loadTasks() {
    this.taskStorage.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.applyFilter();
      },
      error: (error) => {
        console.error('Error loading tasks from IndexedDB:', error);
        this.tasks = [];
      }
    });
  }

  async saveTasks() {
    // Save all tasks that were updated during recurring task checks
    const updatePromises = this.tasks
      .filter(task => task.recurrence !== 'none' && !task.archived)
      .map(task => this.taskStorage.updateTask(task).toPromise());
    
    try {
      await Promise.all(updatePromises);
      console.log('Recurring tasks updated successfully');
    } catch (error) {
      console.error('Error saving recurring tasks:', error);
    }
  }

  checkRecurringTasks() {
    const now = new Date();
    let updated = false;

    this.tasks.forEach(task => {
      if (task.archived) return;

      // --- One-time tasks (recurrence: none) ---
      if (task.recurrence === 'none') {
        if (!task.completed && task.dueDate) {
          const due = new Date(task.dueDate);
          if (now >= due && !task.notifiedOfDue) {
            task.notifiedOfDue = true;
            updated = true;

            // Trigger browser notification
            if (this.notificationsEnabled) {
              this.notificationService.notifyTaskDue(task.title, 'One-time task');
            }
            // Trigger in-app glass toast
            this.showLocalToast('Task Due! ⏰', `"${task.title}" is now due.`, 'warning');
          }
        }
        return; // Skip recurring schedule logic for one-time tasks
      }

      // --- Recurring tasks ---
      if (!task.nextDueDate) {
        task.nextDueDate = task.dueDate ? new Date(task.dueDate) : this.calculateNextDueDate(task.recurrence, now);
        updated = true;
      }

      // Reset completed status if next due date has passed
      if (task.completed && task.nextDueDate) {
        const nextDue = new Date(task.nextDueDate);
        if (now >= nextDue) {
          task.completed = false;
          task.nextDueDate = this.calculateNextDueDate(task.recurrence, now);
          task.notifiedOfDue = false;
          updated = true;
        }
      }

      // Notify if task is NOT completed and has crossed next due date
      if (!task.completed && task.nextDueDate) {
        const nextDue = new Date(task.nextDueDate);
        if (now >= nextDue && !task.notifiedOfDue) {
          task.notifiedOfDue = true;
          updated = true;

          // Trigger browser notification
          if (this.notificationsEnabled) {
            this.notificationService.notifyTaskDue(task.title, task.recurrence);
          }
          // Trigger in-app glass toast
          this.showLocalToast('Task Due! ⏰', `"${task.title}" is now due.`, 'warning');
        }
      }
    });

    if (updated) {
      this.saveTasks();
      this.applyFilter();
    }
  }

  calculateNextDueDate(recurrence: string, from: Date): Date {
    const next = new Date(from);
    
    switch (recurrence) {
      case '2min':
        next.setMinutes(next.getMinutes() + 2);
        break;
      case 'hourly':
        next.setHours(next.getHours() + 1);
        break;
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }
    
    return next;
  }

  saveTask() {
    if (!this.formData.title.trim()) return;

    if (this.editingTask) {
      const updatedTask: Task = {
        ...this.editingTask,
        title: this.formData.title,
        description: this.formData.description,
        priority: this.formData.priority,
        recurrence: this.formData.recurrence,
        dueDate: this.formData.dueDate ? new Date(this.formData.dueDate) : undefined,
        nextDueDate: this.formData.recurrence !== 'none' 
          ? (this.formData.dueDate ? new Date(this.formData.dueDate) : this.calculateNextDueDate(this.formData.recurrence, new Date()))
          : undefined
      };
      
      this.taskStorage.updateTask(updatedTask).subscribe({
        next: () => {
          const index = this.tasks.findIndex(t => t.id === this.editingTask!.id);
          if (index !== -1) {
            this.tasks[index] = updatedTask;
          }
          this.applyFilter();
          this.cancelForm();
        },
        error: (error) => console.error('Error updating task:', error)
      });
    } else {
      const taskData = {
        title: this.formData.title,
        description: this.formData.description,
        completed: false,
        priority: this.formData.priority,
        recurrence: this.formData.recurrence,
        dueDate: this.formData.dueDate ? new Date(this.formData.dueDate) : undefined,
        completionCount: 0,
        archived: false,
        nextDueDate: this.formData.recurrence !== 'none' 
          ? (this.formData.dueDate ? new Date(this.formData.dueDate) : this.calculateNextDueDate(this.formData.recurrence, new Date()))
          : undefined
      };
      
      this.taskStorage.addTask(taskData).subscribe({
        next: (newTask) => {
          this.tasks.unshift(newTask);
          this.applyFilter();
          
          const recurrenceText = this.formData.recurrence === 'none' ? 'one-time task' : `${this.formData.recurrence} recurring task`;
          this.showLocalToast('Task Created! ✅', `"${this.formData.title}" (${recurrenceText}) has been added.`, 'success');

          if (this.notificationsEnabled) {
            this.notificationService.showNotification('Task Created! ✅', {
              body: `${this.formData.title} (${recurrenceText})`,
              tag: 'task-created',
              requireInteraction: false
            });
          }
          
          this.cancelForm();
        },
        error: (error) => console.error('Error adding task:', error)
      });
    }
  }

  editTask(task: Task) {
    this.editingTask = task;
    this.formData = {
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      recurrence: task.recurrence,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : ''
    };
    this.showAddForm = true;
  }

  deleteTask(id: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskStorage.deleteTask(id).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== id);
          this.applyFilter();
        },
        error: (error) => console.error('Error deleting task:', error)
      });
    }
  }

  toggleComplete(id: string) {
    const task = this.tasks.find(t => t.id === id);
    if (task && !task.archived) {
      task.completed = !task.completed;
      task.notifiedOfDue = false;
      
      if (task.completed) {
        task.lastCompleted = new Date();
        task.completionCount = (task.completionCount || 0) + 1;
        
        if (task.recurrence !== 'none') {
          task.nextDueDate = this.calculateNextDueDate(task.recurrence, new Date());
        }
      }
      
      this.taskStorage.updateTask(task).subscribe({
        next: () => {
          this.applyFilter();
        },
        error: (error) => console.error('Error toggling task:', error)
      });
    }
  }

  archiveTask(id: string) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.archived = true;
      this.taskStorage.updateTask(task).subscribe({
        next: () => {
          this.applyFilter();
        },
        error: (error) => console.error('Error archiving task:', error)
      });
    }
  }

  unarchiveTask(id: string) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.archived = false;
      this.taskStorage.updateTask(task).subscribe({
        next: () => {
          this.applyFilter();
        },
        error: (error) => console.error('Error unarchiving task:', error)
      });
    }
  }

  cancelForm() {
    this.showAddForm = false;
    this.editingTask = null;
    this.formData = {
      title: '',
      description: '',
      priority: 'medium',
      recurrence: 'none',
      dueDate: ''
    };
  }

  applyFilter() {
    let filtered = [...this.tasks];

    // Filter by archived status
    filtered = filtered.filter(t => this.showArchived ? t.archived : !t.archived);

    // Filter by status
    if (this.filterStatus === 'active') {
      filtered = filtered.filter(t => !t.completed);
    } else if (this.filterStatus === 'completed') {
      filtered = filtered.filter(t => t.completed);
    }

    // Filter by priority
    if (this.filterPriority) {
      filtered = filtered.filter(t => t.priority === this.filterPriority);
    }

    // Filter by recurrence
    if (this.filterRecurrence) {
      filtered = filtered.filter(t => t.recurrence === this.filterRecurrence);
    }

    // Search
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search)
      );
    }

    this.filteredTasks = filtered;
    this.totalPages = Math.ceil(this.filteredTasks.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    this.updatePagination();
  }

  updatePagination() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedTasks = this.filteredTasks.slice(start, end);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  async checkNotificationPermission() {
    this.notificationsEnabled = this.notificationService.hasPermission();
  }

  async enableNotifications() {
    const granted = await this.notificationService.requestPermission();
    this.notificationsEnabled = granted;
    if (granted) {
      this.showLocalToast('Notifications Enabled! 🔔', 'You will now receive task reminders.', 'success');
      await this.notificationService.showNotification('Notifications Enabled! 🔔', {
        body: 'You will now receive task reminders. If you don\'t see this notification, check Windows Settings → System → Notifications → Google Chrome and enable "Show notification banners".'
      });
    } else {
      alert('Notifications blocked! Please enable notifications in your browser settings.\n\nChrome: Settings → Privacy and security → Site Settings → Notifications\nWindows: Settings → System → Notifications → Google Chrome → Enable');
    }
  }

  initializeWorker() {
    if (typeof Worker !== 'undefined') {
      try {
        this.worker = new Worker(new URL('../../workers/task-checker.worker', import.meta.url), { type: 'module' });
        
        this.worker.onmessage = ({ data }) => {
          if (data.type === 'RESET_TASKS') {
            this.handleTaskResets(data.taskIds);
          }
        };

        // Send tasks to worker every minute
        setInterval(() => {
          if (this.worker) {
            this.worker.postMessage({ type: 'CHECK_TASKS', tasks: this.tasks });
          }
        }, 60000);
      } catch (error) {
        console.log('Web Worker not available, using fallback timer');
      }
    }
  }

  handleTaskResets(taskIds: string[]) {
    taskIds.forEach(id => {
      const task = this.tasks.find(t => t.id === id);
      if (task) {
        task.completed = false;
        task.nextDueDate = this.calculateNextDueDate(task.recurrence, new Date());
        task.notifiedOfDue = false;
        
        this.showLocalToast('Task Reset 🔄', `"${task.title}" has been reset and is ready again!`, 'info');

        // Send browser notification
        if (this.notificationsEnabled) {
          this.notificationService.notifyTaskReset(task.title);
        }
      }
    });
    
    this.saveTasks();
    this.applyFilter();
  }

  ngOnDestroy() {
    if (this.worker) {
      this.worker.terminate();
    }
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}
