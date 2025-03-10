from django.urls import path, include
from . import task_managment, views, auth, user_profile

# This block of code defines the URL patterns for your Django web application. Each `path` function
# call represents a URL pattern that maps a specific URL to a corresponding view function within your
# Django app. Here's a breakdown of what each URL pattern is doing:
#the urls of the app
urlpatterns = [
    #the main url
    path('', views.index, name="index"),
    #the register url
    path("register/", auth.register, name="register"),
    #login url
    path("login/", auth.user_login, name="login"),
    #logout url
    path("logout/", auth.user_logout, name="logout"),
    
    #URL to activate the users account with the Email
    path('activate/<uidb64>/<token>/', auth.activate, name='activate'),

    #URLs for the forget password
    path('password_reset/', auth.CustomPasswordResetView.as_view(), name='password_reset'),
    path('password_reset/done/', auth.CustomPasswordResetDoneView.as_view(), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth.CustomPasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('reset/done/', auth.CustomPasswordResetCompleteView.as_view(), name='password_reset_complete'),

    path('google/login/', auth.google_login, name='google_login'),
    path('google/callback/', auth.google_callback, name='google_callback'),
    path('google/handle-username/', auth.add_username_google_login, name='add_username_google_login'),

    path('today_tasks/', task_managment.today_tasks, name='today_tasks'),
    path('all_tasks/', task_managment.all_tasks, name='all_tasks'),
    path('next_week_tasks/', task_managment.next_week_tasks, name='next_week_tasks'),

    path('add_task/', task_managment.add_task, name='add_task'),
    path('update_task/<int:task_id>/', task_managment.update_task, name='update_task'),
    path('delete_task/<int:task_id>/', task_managment.delete_task, name='delete_task'),
    path('task_complete/<int:task_id>/', task_managment.task_complete, name='task_complete'),
    path('search/', task_managment.search_task, name='search_task'),

    path('password_change/', user_profile.CustomPasswordChangeView.as_view(template_name='password_change.html'), name='password_change'),
    path('password_change/done/', user_profile.CustomPasswordChangeDoneView.as_view(template_name='password_change_done.html'), name='password_change_done'),

    path("update_profile/<int:user_id>",user_profile.update_profile , name="update_profile"),
    path('activate/<uidb64>/<token>/<new_email>/', user_profile.activate_profile_update, name='activate_profile_update'),

    path('privacy/', views.privacy, name='privacy'),
    path('terms/', views.terms, name='terms'),
    path('landing_page/', views.landing_page, name='landing_page'),
]

