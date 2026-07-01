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
  template: `
    <div class="task-tracker">
      <header class="task-header">
        <h1>✅ Task Tracker</h1>
        <p class="subtitle">Manage your tasks with recurring schedules</p>
      </header>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <div class="stat-value">{{ activeTasks.length }}</div>
            <div class="stat-label">Active Tasks</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ completedToday }}</div>
            <div class="stat-label">Completed Today</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔁</div>
          <div class="stat-content">
            <div class="stat-value">{{ recurringTasks.length }}</div>
            <div class="stat-label">Recurring</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-content">
            <div class="stat-value">{{ archivedTasks.length }}</div>
            <div class="stat-label">Archived</div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="task-actions">
        <button class="btn-primary" (click)="showAddForm = !showAddForm">
          {{ showAddForm ? '✕ Cancel' : '+ Add Task' }}
        </button>
        <button class="btn-secondary" (click)="showArchived = !showArchived">
          {{ showArchived ? '📋 Show Active' : '📦 Show Archived' }}
        </button>
        <button 
          class="btn-notification" 
          [class.enabled]="notificationsEnabled"
          (click)="enableNotifications()"
          *ngIf="!notificationsEnabled"
          title="Enable browser notifications">
          🔔 Enable Notifications
        </button>
        <span class="notification-status" *ngIf="notificationsEnabled">
          ✅ Notifications On
        </span>
      </div>

      <!-- Task Form -->
      <div class="task-form" *ngIf="showAddForm">
        <h3>{{ editingTask ? 'Edit Task' : 'Add New Task' }}</h3>
        <form (ngSubmit)="saveTask()">
          <div class="form-group">
            <label for="title">Title *</label>
            <input 
              id="title"
              type="text" 
              [(ngModel)]="formData.title" 
              name="title"
              placeholder="e.g., Drink water, Visit temple"
              required>
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea 
              id="description"
              [(ngModel)]="formData.description" 
              name="description"
              rows="3"
              placeholder="Add details about this task"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="priority">Priority</label>
              <select id="priority" [(ngModel)]="formData.priority" name="priority">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div class="form-group">
              <label for="recurrence">Recurrence</label>
              <select id="recurrence" [(ngModel)]="formData.recurrence" name="recurrence">
                <option value="none">None (One-time)</option>
                <option value="2min">Every 2 Minutes (Testing)</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div class="form-group" *ngIf="formData.recurrence === 'none'">
            <label for="dueDate">Due Date</label>
            <input 
              id="dueDate"
              type="date" 
              [(ngModel)]="formData.dueDate" 
              name="dueDate">
          </div>

          <div class="recurrence-info" *ngIf="formData.recurrence !== 'none'">
            <div class="info-box">
              <span class="info-icon">ℹ️</span>
              <span>This task will repeat {{ formData.recurrence }}. Complete it to track your progress!</span>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="cancelForm()">
              Cancel
            </button>
            <button type="submit" class="btn-primary">
              {{ editingTask ? 'Update' : 'Add' }} Task
            </button>
          </div>
        </form>
      </div>

      <!-- Filter & Search -->
      <div class="filter-container">
        <select [(ngModel)]="filterStatus" (change)="applyFilter()">
          <option value="all">All Tasks</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
        <select [(ngModel)]="filterPriority" (change)="applyFilter()">
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select [(ngModel)]="filterRecurrence" (change)="applyFilter()">
          <option value="">All Types</option>
          <option value="none">One-time</option>
          <option value="2min">Every 2 Minutes</option>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        <input 
          type="text" 
          [(ngModel)]="searchTerm" 
          (input)="applyFilter()"
          placeholder="Search tasks...">
      </div>

      <!-- Pagination Info -->
      <div class="pagination-info" *ngIf="filteredTasks.length > pageSize">
        <span>Showing {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredTasks.length) }} of {{ filteredTasks.length }} tasks</span>
      </div>

      <!-- Task List -->
      <div class="task-list">
        <div *ngIf="paginatedTasks.length === 0" class="empty-state">
          <div class="empty-icon">{{ showArchived ? '📦' : '📝' }}</div>
          <h3>{{ showArchived ? 'No archived tasks' : 'No tasks found' }}</h3>
          <p>{{ showArchived ? 'Completed tasks will appear here when archived' : 'Create your first task to get started!' }}</p>
        </div>

        <div 
          *ngFor="let task of paginatedTasks" 
          class="task-item"
          [class.completed]="task.completed"
          [class.high-priority]="task.priority === 'high'"
          [class.recurring]="task.recurrence !== 'none'"
          [class.archived]="task.archived">
          
          <div class="task-checkbox">
            <input 
              type="checkbox" 
              [checked]="task.completed"
              (change)="toggleComplete(task.id)"
              [disabled]="task.archived">
          </div>

          <div class="task-content">
            <div class="task-title-row">
              <h4 class="task-title">{{ task.title }}</h4>
              <span class="recurrence-badge" *ngIf="task.recurrence !== 'none'">
                🔁 {{ task.recurrence }}
              </span>
            </div>
            <p class="task-description" *ngIf="task.description">
              {{ task.description }}
            </p>
            <div class="task-meta">
              <span class="priority-badge" [class]="'priority-' + task.priority">
                {{ task.priority }}
              </span>
              <span class="due-date" *ngIf="task.dueDate && task.recurrence === 'none'">
                📅 {{ formatDate(task.dueDate) }}
              </span>
              <span class="next-due" *ngIf="task.nextDueDate && task.recurrence !== 'none'">
                ⏰ Next: {{ formatDate(task.nextDueDate) }}
              </span>
              <span class="completion-count" *ngIf="task.completionCount > 0">
                ✓ Completed {{ task.completionCount }}x
              </span>
              <span class="last-completed" *ngIf="task.lastCompleted">
                Last: {{ formatDate(task.lastCompleted) }}
              </span>
            </div>
          </div>

          <div class="task-actions-btns">
            <button 
              class="btn-icon" 
              (click)="editTask(task)"
              *ngIf="!task.archived"
              title="Edit task">
              ✏️
            </button>
            <button 
              class="btn-icon btn-archive" 
              (click)="archiveTask(task.id)"
              *ngIf="!task.archived && task.recurrence === 'none'"
              title="Archive task">
              📦
            </button>
            <button 
              class="btn-icon btn-unarchive" 
              (click)="unarchiveTask(task.id)"
              *ngIf="task.archived"
              title="Unarchive task">
              📤
            </button>
            <button 
              class="btn-icon btn-delete" 
              (click)="deleteTask(task.id)"
              title="Delete task">
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="totalPages > 1">
        <button 
          class="btn-page" 
          (click)="goToPage(currentPage - 1)"
          [disabled]="currentPage === 1">
          ← Previous
        </button>
        <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
        <button 
          class="btn-page" 
          (click)="goToPage(currentPage + 1)"
          [disabled]="currentPage === totalPages">
          Next →
        </button>
      </div>

      <!-- Floating Glass Toasts -->
      <div class="local-toast-container">
        <div *ngFor="let toast of activeToasts" class="local-toast" [class]="toast.type">
          <span class="toast-close" (click)="removeToast(toast.id)">×</span>
          <div class="toast-content">
            <span class="toast-title">{{ toast.title }}</span>
            <span class="toast-message">{{ toast.message }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .task-tracker {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem;
      background: transparent;
      min-height: 100vh;
    }

    .task-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .task-header h1 {
      font-size: 3rem;
      font-weight: 800;
      margin: 0 0 0.5rem 0;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-family: 'Outfit', sans-serif;
    }

    .subtitle {
      color: var(--color-text-secondary);
      font-size: 1.1rem;
      font-weight: 500;
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }

    .stat-card {
      background: var(--color-card-bg, var(--color-surface));
      backdrop-filter: blur(var(--glass-blur)) saturate(180%);
      -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(180%);
      border: 1px solid var(--color-card-border, var(--glass-border));
      border-radius: 18px;
      padding: 1.5rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
      box-shadow: var(--glass-shadow);
    }

    .stat-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.1);
      border-color: rgba(var(--color-primary-rgb), 0.25);
    }

    .stat-icon {
      font-size: 1.75rem;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(var(--color-primary-rgb), 0.08);
      border-radius: 12px;
    }

    .stat-value {
      font-size: 1.85rem;
      font-weight: 800;
      font-family: 'Outfit', sans-serif;
      color: var(--color-primary);
      line-height: 1.1;
    }

    .stat-label {
      font-size: 0.725rem;
      font-weight: 700;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .task-actions {
      display: flex;
      justify-content: center;
      gap: 1.25rem;
      margin: 2.5rem 0;
      flex-wrap: wrap;
    }

    .btn-primary {
      background: var(--gradient-primary);
      color: white;
      border: none;
      padding: 0.75rem 1.75rem;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 14px rgba(var(--color-primary-rgb), 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(var(--color-primary-rgb), 0.4);
    }

    .btn-secondary {
      background: rgba(var(--color-primary-rgb), 0.08);
      color: var(--color-primary);
      border: 1px solid rgba(var(--color-primary-rgb), 0.2);
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .btn-secondary:hover {
      background: rgba(var(--color-primary-rgb), 0.15);
      border-color: rgba(var(--color-primary-rgb), 0.3);
    }

    .btn-notification {
      background: var(--gradient-accent);
      color: white;
      border: none;
      padding: 0.75rem 1.75rem;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: 0 4px 14px rgba(236, 72, 153, 0.25);
    }

    .btn-notification:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(236, 72, 153, 0.35);
    }

    .notification-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .task-form {
      background: var(--color-card-bg, var(--color-surface));
      backdrop-filter: blur(var(--glass-blur)) saturate(180%);
      -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(180%);
      border: 1px solid var(--color-card-border, var(--glass-border));
      border-radius: 20px;
      padding: 2.5rem;
      margin-bottom: 2.5rem;
      box-shadow: var(--glass-shadow);
      animation: formSlideIn 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes formSlideIn {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .task-form h3 {
      margin: 0 0 1.5rem 0;
      font-size: 1.5rem;
      font-weight: 700;
      font-family: 'Outfit', sans-serif;
      color: var(--color-text-primary);
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--color-text);
      font-size: 0.875rem;
      letter-spacing: 0.01em;
    }

    input, textarea, select {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.04);
      color: var(--color-text);
      font-size: 1rem;
      transition: all 0.25s ease;
      font-family: inherit;
    }

    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.15);
    }

    .recurrence-info {
      margin-bottom: 1.5rem;
    }

    .info-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: rgba(var(--color-primary-rgb), 0.06);
      border: 1px solid rgba(var(--color-primary-rgb), 0.15);
      border-radius: 12px;
      color: var(--color-primary);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .info-icon {
      font-size: 1.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    .filter-container {
      display: grid;
      grid-template-columns: auto auto auto 1fr;
      gap: 1rem;
      padding: 1.25rem;
      background: var(--color-surface);
      backdrop-filter: blur(var(--glass-blur)) saturate(180%);
      -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(180%);
      border: 1px solid var(--glass-border);
      border-radius: 16px;
      margin-bottom: 2rem;
      box-shadow: var(--glass-shadow);
      
      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .pagination-info {
      text-align: center;
      color: var(--color-text-secondary);
      font-size: 0.875rem;
      margin-bottom: 1.25rem;
      font-weight: 500;
    }

    .task-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-bottom: 2.5rem;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--color-text-secondary);
      background: var(--color-surface);
      backdrop-filter: blur(var(--glass-blur)) saturate(180%);
      -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(180%);
      border: 1px solid var(--glass-border);
      border-radius: 20px;
      box-shadow: var(--glass-shadow);
      
      h3 {
        font-weight: 700;
        color: var(--color-text-primary);
      }
    }

    .empty-icon {
      font-size: 3.5rem;
      margin-bottom: 1rem;
    }

    .task-item {
      display: flex;
      gap: 1.25rem;
      padding: 1.5rem;
      background: var(--color-card-bg, var(--color-surface));
      backdrop-filter: blur(var(--glass-blur)) saturate(180%);
      -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(180%);
      border: 1px solid var(--color-card-border, var(--glass-border));
      border-radius: 18px;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease, border-color 0.3s ease;
      box-shadow: var(--glass-shadow);
    }

    .task-item:hover {
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
      transform: translateY(-3px);
      border-color: rgba(var(--color-primary-rgb), 0.25);
    }

    .task-item.completed {
      opacity: 0.65;
      background: rgba(255, 255, 255, 0.02);
    }

    .task-item.completed .task-title {
      text-decoration: line-through;
      color: var(--color-text-secondary);
    }

    .task-item.high-priority {
      border-left: 5px solid var(--color-danger);
    }

    .task-item.recurring {
      border-left: 5px solid var(--color-accent);
    }

    .task-item.archived {
      opacity: 0.6;
      background: rgba(0, 0, 0, 0.03);
    }

    .task-checkbox {
      display: flex;
      align-items: flex-start;
      padding-top: 0.25rem;
    }

    .task-checkbox input {
      width: 22px;
      height: 22px;
      cursor: pointer;
      accent-color: var(--color-primary);
    }

    .task-content {
      flex: 1;
    }

    .task-title-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .task-title {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .recurrence-badge {
      padding: 0.25rem 0.75rem;
      background: rgba(var(--color-primary-rgb), 0.1);
      color: var(--color-primary);
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .task-description {
      margin: 0 0 0.75rem 0;
      color: var(--color-text-secondary);
      line-height: 1.55;
      font-size: 0.95rem;
    }

    .task-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
    }

    .priority-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .priority-high {
      background: rgba(239, 68, 68, 0.1);
      color: var(--color-danger);
    }

    .priority-medium {
      background: rgba(245, 158, 11, 0.1);
      color: #d97706;
    }

    .priority-low {
      background: rgba(59, 130, 246, 0.1);
      color: var(--color-primary);
    }

    .due-date, .next-due, .completion-count, .last-completed {
      font-size: 0.825rem;
      color: var(--color-text-secondary);
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-weight: 500;
    }

    .completion-count {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-weight: 700;
    }

    .task-actions-btns {
      display: flex;
      gap: 0.25rem;
      align-items: flex-start;
    }

    .btn-icon {
      background: transparent;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 10px;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background: rgba(var(--color-primary-rgb), 0.08);
    }

    .btn-archive:hover {
      background: rgba(245, 158, 11, 0.08);
    }

    .btn-unarchive:hover {
      background: rgba(59, 130, 246, 0.08);
    }

    .btn-delete:hover {
      background: rgba(239, 68, 68, 0.08);
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem;
      background: var(--color-card-bg, var(--color-surface));
      backdrop-filter: blur(var(--glass-blur)) saturate(180%);
      -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(180%);
      border: 1px solid var(--color-card-border, var(--glass-border));
      border-radius: 16px;
      box-shadow: var(--glass-shadow);
    }

    .btn-page {
      padding: 0.5rem 1.25rem;
      background: rgba(var(--color-primary-rgb), 0.05);
      border: 1px solid var(--glass-border);
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.25s ease;
      font-weight: 600;
      color: var(--color-text);
    }

    .btn-page:hover:not(:disabled) {
      background: rgba(var(--color-primary-rgb), 0.1);
      border-color: rgba(var(--color-primary-rgb), 0.25);
    }

    .btn-page:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .page-info {
      color: #64748b;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .task-tracker {
        padding: 1rem;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .filter-container {
        grid-template-columns: 1fr;
      }

      .task-actions {
        flex-direction: column;
      }

      .task-item {
        flex-direction: column;
      }

      .task-actions-btns {
        justify-content: flex-end;
      }
    }

    /* Floating Glass Toasts */
    .local-toast-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      pointer-events: none;
      max-width: 320px;
      width: 100%;
    }

    .local-toast {
      pointer-events: auto;
      background: var(--color-card-bg, rgba(255, 255, 255, 0.45));
      backdrop-filter: blur(var(--glass-blur, 10px)) saturate(180%);
      -webkit-backdrop-filter: blur(var(--glass-blur, 10px)) saturate(180%);
      border: 1px solid var(--color-card-border, rgba(255, 255, 255, 0.15));
      border-radius: 12px;
      padding: 0.875rem 1rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      display: flex;
      flex-direction: column;
      position: relative;
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      border-left: 4px solid var(--color-primary);

      &.success {
        border-left-color: #10b981;
      }
      &.warning {
        border-left-color: #f59e0b;
      }
      &.info {
        border-left-color: var(--color-primary);
      }
    }

    .toast-close {
      position: absolute;
      top: 0.375rem;
      right: 0.5rem;
      font-size: 1rem;
      color: var(--color-text-secondary);
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s;
      &:hover { opacity: 1; }
    }

    .toast-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .toast-title {
      font-weight: 700;
      font-size: 0.9rem;
      color: var(--color-text);
    }

    .toast-message {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
      line-height: 1.4;
    }

    @keyframes slideIn {
      from {
        transform: translateX(120%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
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
      if (task.recurrence === 'none' || task.archived) return;

      if (!task.nextDueDate) {
        task.nextDueDate = this.calculateNextDueDate(task.recurrence, now);
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
          ? this.calculateNextDueDate(this.formData.recurrence, new Date())
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
          ? this.calculateNextDueDate(this.formData.recurrence, new Date())
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
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
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
