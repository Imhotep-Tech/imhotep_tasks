import unittest
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from tasks.models import Tasks

User = get_user_model()

class SearchPaginationTestCase(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username='searchuser',
            email='searchuser@example.com',
            password='password123',
            email_verify=True
        )
        
        # Create client for testing views
        self.client = Client()
        
        # Log in the client
        self.client.login(username='searchuser', password='password123')
        
        # Create 25 test tasks with different titles for pagination testing
        self.task_titles = [
            # Project Alpha tasks
            "Alpha Task 1", "Alpha Project Planning", "Alpha Review Meeting",
            "Alpha Documentation", "Alpha User Testing",
            
            # Project Beta tasks
            "Beta Task 1", "Beta Development", "Beta QA Testing",
            "Beta Release Planning", "Beta Client Demo",
            
            # Project Gamma tasks
            "Gamma Task 1", "Gamma Research", "Gamma Prototype",
            "Gamma Stakeholder Meeting", "Gamma Analysis",
            
            # Generic tasks with unique names
            "Purchase office supplies", "Schedule team lunch", "Update website",
            "Review budget", "Interview candidates",
            
            # Tasks with numbers to test numeric searches
            "Task 123", "Project 456", "Meeting 789", "Review 101", "Plan 202"
        ]
        
        # Create tasks with different dates
        for i, title in enumerate(self.task_titles):
            # Alternate between completed and not completed tasks
            status = bool(i % 2)
            
            # Create different dates for tasks
            days_offset = i % 14  # Spread tasks over two weeks
            task_date = timezone.now() + timedelta(days=days_offset)
            
            # Create the task
            task = Tasks.objects.create(
                task_title=title,
                task_details=f"Details for {title}",
                due_date=task_date,
                created_by=self.user,
                status=status
            )
            
            # Set done_date for completed tasks
            if status:
                task.done_date = timezone.now()
                task.save()

    def test_search_exact_match(self):
        """Test searching for tasks with exact title match"""
        response = self.client.get(reverse('search_task'), {'task_title': 'Alpha Task 1'})
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Alpha Task 1')
        self.assertNotContains(response, 'Beta Task 1')
        self.assertEqual(len(response.context['user_tasks']), 1)
        self.assertEqual(response.context['tasks_title'], "Search Results for 'Alpha Task 1'")

    def test_search_partial_match(self):
        """Test searching for tasks with partial title match"""
        response = self.client.get(reverse('search_task'), {'task_title': 'Alpha'})
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Alpha Task 1')
        self.assertContains(response, 'Alpha Project Planning')
        self.assertContains(response, 'Alpha Review Meeting')
        self.assertNotContains(response, 'Beta Task 1')
        
        # Should find 5 Alpha tasks
        self.assertEqual(len(response.context['user_tasks']), 5)
        self.assertEqual(response.context['tasks_title'], "Search Results for 'Alpha'")

    def test_search_case_insensitive(self):
        """Test that search is case insensitive"""
        response = self.client.get(reverse('search_task'), {'task_title': 'alpha'})
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Alpha Task 1')
        self.assertEqual(len(response.context['user_tasks']), 5)

    def test_search_no_results(self):
        """Test searching for a term with no matches"""
        response = self.client.get(reverse('search_task'), {'task_title': 'nonexistent'})
        
        self.assertEqual(response.status_code, 200)
        self.assertNotContains(response, 'Alpha Task 1')
        self.assertEqual(len(response.context['user_tasks']), 0)
        self.assertEqual(response.context['total_number_tasks'], 0)

    def test_search_numeric(self):
        """Test searching for numeric values in titles"""
        response = self.client.get(reverse('search_task'), {'task_title': '123'})
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Task 123')
        self.assertEqual(len(response.context['user_tasks']), 1)

    def test_search_empty_query(self):
        """Test searching with an empty query redirects to all_tasks"""
        response = self.client.get(reverse('search_task'), {'task_title': ''})
        
        # Should redirect to all_tasks
        self.assertRedirects(response, reverse('all_tasks'))

    def test_search_context_data(self):
        """Test that search results contain the correct context data"""
        response = self.client.get(reverse('search_task'), {'task_title': 'Alpha'})
        
        # Check context contains all the expected data
        self.assertEqual(response.context['username'], self.user.username)
        self.assertEqual(response.context['search_term'], 'Alpha')
        self.assertEqual(response.context['total_number_tasks'], 5)
        
        # Check completed tasks count is correctly calculated
        completed_count = sum(1 for task in response.context['user_tasks'] if task.status)
        self.assertEqual(response.context['completed_tasks_count'], completed_count)
        
        # Check pending tasks count is correctly calculated
        self.assertEqual(
            response.context['pending_tasks'],
            response.context['total_number_tasks'] - response.context['completed_tasks_count']
        )

    def test_pagination_first_page(self):
        """Test pagination of search results - first page"""
        # Count how many task titles actually contain "Task"
        task_count = sum(1 for title in self.task_titles if 'Task' in title)
        
        # Search for tasks containing "Task" 
        response = self.client.get(reverse('search_task'), {'task_title': 'Task'})
        
        # We expect all matching tasks (should be 4) on the first page since it's less than 20
        self.assertEqual(len(response.context['user_tasks']), 4)
        
        # With only 4 items, there should be no next page
        self.assertFalse(response.context['user_tasks'].has_next())
        self.assertFalse(response.context['user_tasks'].has_previous())
        self.assertEqual(response.context['user_tasks'].number, 1)  # Current page

    def test_pagination_with_more_results(self):
        """Test pagination with enough results to paginate"""
        # Use a search term that will match more tasks - "a" appears in many titles
        response = self.client.get(reverse('search_task'), {'task_title': 'a'})
        
        # Calculate how many tasks contain "a"
        tasks_with_a = sum(1 for title in self.task_titles if 'a' in title.lower())
        
        # If there are more than 20 matching tasks, we should see pagination
        if tasks_with_a > 20:
            self.assertEqual(len(response.context['user_tasks']), 20)
            self.assertTrue(response.context['user_tasks'].has_next())
        else:
            # Otherwise, we'll see all matching tasks
            self.assertEqual(len(response.context['user_tasks']), tasks_with_a)
            
        self.assertFalse(response.context['user_tasks'].has_previous())
        self.assertEqual(response.context['user_tasks'].number, 1)

    def test_pagination_second_page(self):
        """Test pagination of search results - second page"""
        # First, we need a search that returns enough results to paginate
        # Search for "a" which should appear in most tasks
        
        # Count tasks containing "a" to see if we have enough for a second page
        tasks_with_a = sum(1 for title in self.task_titles if 'a' in title.lower())
        
        # Only run this test if we have enough results to create a second page
        if tasks_with_a <= 20:
            # Skip this test with a message if we don't have enough data
            self.skipTest("Not enough matching tasks to test second page pagination")
            return
            
        # Get the second page of results
        response = self.client.get(reverse('search_task'), {'task_title': 'a', 'page': 2})
        
        # We should have the remaining tasks on the second page
        remaining_tasks = tasks_with_a - 20
        self.assertEqual(len(response.context['user_tasks']), remaining_tasks)
        
        # Check pagination info is in the context
        self.assertFalse(response.context['user_tasks'].has_next())
        self.assertTrue(response.context['user_tasks'].has_previous())
        self.assertEqual(response.context['user_tasks'].number, 2)  # Current page

    def test_pagination_invalid_page(self):
        """Test pagination with an invalid page number"""
        # First determine how many tasks contain "a" 
        tasks_with_a = sum(1 for title in self.task_titles if 'a' in title.lower())
        
        # Calculate expected last page number
        last_page = (tasks_with_a + 19) // 20  # Ceiling division
        
        # Request a non-existent page
        response = self.client.get(reverse('search_task'), {'task_title': 'a', 'page': 999})
        
        # Should return the last available page
        self.assertEqual(response.context['user_tasks'].number, last_page)  # Last page

    def test_pagination_non_integer_page(self):
        """Test pagination with a non-integer page value"""
        # Request with a non-integer page
        response = self.client.get(reverse('search_task'), {'task_title': 'a', 'page': 'abc'})
        
        # Should return the first page
        self.assertEqual(response.context['user_tasks'].number, 1)
        
    def test_search_preserves_pagination(self):
        """Test that pagination parameters are preserved in search results"""
        # First determine how many tasks contain "a" 
        tasks_with_a = sum(1 for title in self.task_titles if 'a' in title.lower())
        
        # Only run this test if we have enough results to create a second page
        if tasks_with_a <= 20:
            # Skip this test with a message if we don't have enough data
            self.skipTest("Not enough matching tasks to test pagination parameter preservation")
            return
            
        # Make a search request with page parameter
        response = self.client.get(reverse('search_task'), {'task_title': 'a', 'page': 2})
        
        # Check the page number is correctly applied
        self.assertEqual(response.context['user_tasks'].number, 2)
        
        # Check that the pagination links in the template contain both search term and page
        self.assertContains(response, 'task_title=a')

if __name__ == '__main__':
    unittest.main()