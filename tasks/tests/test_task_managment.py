import unittest
from django.test import TestCase, Client, RequestFactory
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.contrib.messages.storage.fallback import FallbackStorage
from django.contrib.sessions.middleware import SessionMiddleware
from datetime import date, timedelta
from django.utils import timezone
from tasks.models import Tasks

from tasks.user import (
    add_task, update_task, delete_task, task_complete
)

User = get_user_model()

class TaskManagementTestCase(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username='taskuser',
            email='taskuser@example.com',
            password='password123',
            email_verify=True
        )
        
        # Create client and factory for testing views
        self.client = Client()
        self.factory = RequestFactory()
        
        # Log in the client
        self.client.login(username='taskuser', password='password123')
        
        # Set up dates for testing
        self.today = timezone.now().date()
        self.tomorrow = self.today + timedelta(days=1)
        self.next_week = self.today + timedelta(days=6)
        self.two_weeks = self.today + timedelta(days=14)
        
        # Create some test tasks
        self.today_task = Tasks.objects.create(
            task_title='Today Task',
            task_details='This task is due today',
            due_date=timezone.now(),
            created_by=self.user
        )
        
        self.tomorrow_task = Tasks.objects.create(
            task_title='Tomorrow Task',
            task_details='This task is due tomorrow',
            due_date=timezone.now() + timedelta(days=1),
            created_by=self.user
        )
        
        self.next_week_task = Tasks.objects.create(
            task_title='Next Week Task',
            task_details='This task is due next week',
            due_date=timezone.now() + timedelta(days=6),
            created_by=self.user
        )
        
        self.future_task = Tasks.objects.create(
            task_title='Future Task',
            task_details='This task is due in two weeks',
            due_date=timezone.now() + timedelta(days=14),
            created_by=self.user
        )
        
    def add_session_to_request(self, request):
        """Helper method to add session to request"""
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request)
        request.session.save()
        return request
        
    def add_message_middleware(self, request):
        """Helper method to add message middleware to request"""
        if not hasattr(request, 'session'):
            request = self.add_session_to_request(request)
        
        messages = FallbackStorage(request)
        setattr(request, '_messages', messages)
        return request

    def test_today_tasks_view(self):
        """Test that today_tasks view shows only today's tasks"""
        response = self.client.get(reverse('today_tasks'))
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Today Task')
        self.assertNotContains(response, 'Tomorrow Task')
        self.assertNotContains(response, 'Future Task')
        self.assertEqual(len(response.context['user_tasks']), 1)

    def test_next_week_tasks_view(self):
        """Test that next_week_tasks view shows tasks for the next 7 days"""
        response = self.client.get(reverse('next_week_tasks'))
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Today Task')
        self.assertContains(response, 'Tomorrow Task')
        self.assertContains(response, 'Next Week Task')
        self.assertNotContains(response, 'Future Task')
        self.assertEqual(len(response.context['user_tasks']), 3)

    def test_all_tasks_view(self):
        """Test that all_tasks view shows all tasks"""
        response = self.client.get(reverse('all_tasks'))
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Today Task')
        self.assertContains(response, 'Tomorrow Task')
        self.assertContains(response, 'Next Week Task')
        self.assertContains(response, 'Future Task')
        self.assertEqual(len(response.context['user_tasks']), 4)

    def test_add_task_get(self):
        """Test GET request to add_task view"""
        response = self.client.get(reverse('add_task'))
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Create New Task')

    def test_add_task_post_without_due_date(self):
        """Test adding a task without specifying a due date"""
        initial_count = Tasks.objects.count()
        
        response = self.client.post(reverse('add_task'), {
            'task_title': 'New Task Without Due Date',
            'task_details': 'This is a test task without due date'
        }, follow=True)
        
        self.assertEqual(Tasks.objects.count(), initial_count + 1)
        new_task = Tasks.objects.get(task_title='New Task Without Due Date')
        self.assertEqual(new_task.task_details, 'This is a test task without due date')
        self.assertIsNotNone(new_task.due_date)  # Should have default due date
        
        # Should redirect to today_tasks
        self.assertRedirects(response, reverse('today_tasks'))
        self.assertContains(response, 'Task added successfully')

    def test_add_task_post_with_due_date_today(self):
        """Test adding a task with today's due date"""
        initial_count = Tasks.objects.count()
        
        # Format today's date for the form
        today_str = timezone.now().strftime('%Y-%m-%dT%H:%M')
        
        response = self.client.post(reverse('add_task'), {
            'task_title': 'New Today Task',
            'task_details': 'This task is due today',
            'due_date': today_str
        }, follow=True)
        
        self.assertEqual(Tasks.objects.count(), initial_count + 1)
        new_task = Tasks.objects.get(task_title='New Today Task')
        
        # Should redirect to today_tasks
        self.assertRedirects(response, reverse('today_tasks'))

    def test_add_task_post_with_due_date_future(self):
        """Test adding a task with a future due date"""
        initial_count = Tasks.objects.count()
        
        # Format future date for the form (two weeks from now)
        future_date = (timezone.now() + timedelta(days=14)).strftime('%Y-%m-%dT%H:%M')
        
        response = self.client.post(reverse('add_task'), {
            'task_title': 'New Future Task',
            'task_details': 'This task is due in two weeks',
            'due_date': future_date
        }, follow=True)
        
        self.assertEqual(Tasks.objects.count(), initial_count + 1)
        new_task = Tasks.objects.get(task_title='New Future Task')
        
        # Should redirect to all_tasks since it's more than a week away
        self.assertRedirects(response, reverse('all_tasks'))

    def test_update_task_get(self):
        """Test GET request to update_task view"""
        response = self.client.get(reverse('update_task', args=[self.today_task.id]))
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Update Task')
        self.assertContains(response, self.today_task.task_title)
        self.assertContains(response, self.today_task.task_details)

    def test_update_task_post(self):
        """Test updating a task"""
        updated_title = 'Updated Task Title'
        updated_details = 'Updated task details'
        
        response = self.client.post(reverse('update_task', args=[self.today_task.id]), {
            'task_title': updated_title,
            'task_details': updated_details,
            'due_date': timezone.now().strftime('%Y-%m-%dT%H:%M')
        }, follow=True)
        
        # Refresh from database
        self.today_task.refresh_from_db()
        
        # Check that values were updated
        self.assertEqual(self.today_task.task_title, updated_title)
        self.assertEqual(self.today_task.task_details, updated_details)
        
        # Should redirect to today_tasks
        self.assertRedirects(response, reverse('today_tasks'))
        self.assertContains(response, 'Task updated successfully')

    def test_update_task_change_due_date(self):
        """Test changing a task's due date"""
        # Change today's task to be due next week
        future_date = (timezone.now() + timedelta(days=10)).strftime('%Y-%m-%dT%H:%M')
        
        response = self.client.post(reverse('update_task', args=[self.today_task.id]), {
            'task_title': self.today_task.task_title,
            'task_details': self.today_task.task_details,
            'due_date': future_date
        }, follow=True)
        
        # Refresh from database
        self.today_task.refresh_from_db()
        
        # Should redirect to all_tasks since it's more than a week away
        self.assertRedirects(response, reverse('all_tasks'))

    def test_delete_task(self):
        """Test deleting a task"""
        initial_count = Tasks.objects.count()
        
        response = self.client.post(reverse('delete_task', args=[self.today_task.id]), follow=True)
        
        # Check that task was deleted
        self.assertEqual(Tasks.objects.count(), initial_count - 1)
        self.assertFalse(Tasks.objects.filter(id=self.today_task.id).exists())
        
        # Should redirect to today_tasks
        self.assertRedirects(response, reverse('today_tasks'))
        self.assertContains(response, 'Task Delete successfully')

    def test_task_complete(self):
        """Test marking a task as complete"""
        self.assertFalse(self.today_task.status)  # Initially not complete
        self.assertIsNone(self.today_task.done_date)  # No completion date
        
        response = self.client.post(reverse('task_complete', args=[self.today_task.id]), follow=True)
        
        # Refresh from database
        self.today_task.refresh_from_db()
        
        # Check that task is now complete
        self.assertTrue(self.today_task.status)
        self.assertIsNotNone(self.today_task.done_date)
        
        # Should redirect to today_tasks
        self.assertRedirects(response, reverse('today_tasks'))

    def test_task_uncomplete(self):
        """Test unmarking a completed task"""
        # First mark as complete
        self.today_task.status = True
        self.today_task.done_date = timezone.now()
        self.today_task.save()
        
        response = self.client.post(reverse('task_complete', args=[self.today_task.id]), follow=True)
        
        # Refresh from database
        self.today_task.refresh_from_db()
        
        # Check that task is now incomplete
        self.assertFalse(self.today_task.status)
        self.assertIsNone(self.today_task.done_date)

    def test_unauthorized_access(self):
        """Test that users can't access or modify other users' tasks"""
        # Create another user
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='password123',
            email_verify=True
        )
        
        # Create a task for the other user
        other_task = Tasks.objects.create(
            task_title='Other User Task',
            task_details='This task belongs to another user',
            due_date=timezone.now(),
            created_by=other_user
        )
        
        # Try to view the task
        response = self.client.get(reverse('update_task', args=[other_task.id]))
        self.assertEqual(response.status_code, 404)  # Should get not found
        
        # Try to update the task
        response = self.client.post(reverse('update_task', args=[other_task.id]), {
            'task_title': 'Tried to update',
            'task_details': 'Should not work',
            'due_date': timezone.now().strftime('%Y-%m-%dT%H:%M')
        })
        self.assertEqual(response.status_code, 404)  # Should get not found
        
        # Try to delete the task
        response = self.client.post(reverse('delete_task', args=[other_task.id]))
        self.assertEqual(response.status_code, 404)  # Should get not found
        self.assertTrue(Tasks.objects.filter(id=other_task.id).exists())  # Task should still exist
        
        # Try to mark as complete
        response = self.client.post(reverse('task_complete', args=[other_task.id]))
        self.assertEqual(response.status_code, 404)  # Should get not found
        
        # Refresh from database
        other_task.refresh_from_db()
        self.assertFalse(other_task.status)  # Task should still be incomplete

if __name__ == '__main__':
    unittest.main()