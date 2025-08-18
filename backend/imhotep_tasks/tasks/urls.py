from django.urls import path, include
from . import task_managment, views, routine_managment
from .auth import login, register, logout, google_auth, forget_password, profile

from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)

# This block of code defines the URL patterns for your Django web application. Each `path` function
# call represents a URL pattern that maps a specific URL to a corresponding view function within your
# Django app. Here's a breakdown of what each URL pattern is doing:
#the urls of the app
urlpatterns = [
    
    path('user-data/', views.user_view, name='user_data'),
    
    # Authentication endpoints
    path('auth/login/', login.login_view, name='login'),
    path('auth/logout/', logout.logout_view, name='logout'),
    path('auth/register/', register.register_view, name='register'),
    path('auth/verify-email/', register.verify_email, name='verify_email'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    #Password Reset endpoints
    path('auth/password-reset/', forget_password.password_reset_request, name='password_reset_request'),
    path('auth/password-reset/confirm/', forget_password.password_reset_confirm, name='password_reset_confirm'),
    path('auth/password-reset/validate/', forget_password.password_reset_validate, name='password_reset_validate'),

    #Google OAuth endpoints
    path('auth/google/url/', google_auth.google_login_url, name='google_login_url'),
    path('auth/google/authenticate/', google_auth.google_auth, name='google_auth'),
    path('auth/google/callback/', google_auth.google_callback, name='google_callback'),

    #Profile endpoints
    path('profile/', profile.get_profile, name='get_profile'),
    path('profile/update/', profile.update_profile, name='update_profile'),
    path('profile/change-password/', profile.change_password, name='change_password'),
    path('profile/verify-email-change/', profile.verify_email_change, name='verify_email_change'),

    #Tasks management URLs
    path('today_tasks/', task_managment.today_tasks, name='today_tasks'),
    path('all_tasks/', task_managment.all_tasks, name='all_tasks'),
    path('next_week_tasks/', task_managment.next_week_tasks, name='next_week_tasks'),

    path('add_task/', task_managment.add_task, name='add_task'),
    path('update_task/<int:task_id>/', task_managment.update_task, name='update_task'),
    path('delete_task/<int:task_id>/', task_managment.delete_task, name='delete_task'),
    path('task_complete/<int:task_id>/', task_managment.task_complete, name='task_complete'),
    path('search/', task_managment.search_task, name='search_task'),

    # Routine management URLs
    path('routines/', routine_managment.show_routines, name='show_routines'),
    path('add_routine/', routine_managment.add_routine, name='add_routine'),
    path('update_routine/<int:routine_id>/', routine_managment.update_routine, name='update_routine'),
    path('delete_routine/<int:routine_id>/', routine_managment.delete_routine, name='delete_routine'),
    path('update_routine_status/<int:routine_id>/', routine_managment.update_routine_status, name='update_routine_status'),
    path('apply_routines/', routine_managment.apply_routines_view, name='apply_routines'),

]

