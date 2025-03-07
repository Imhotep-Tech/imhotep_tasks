from django.urls import path, include
from . import views, auth, user

# This block of code defines the URL patterns for your Django web application. Each `path` function
# call represents a URL pattern that maps a specific URL to a corresponding view function within your
# Django app. Here's a breakdown of what each URL pattern is doing:
#the urls of the app
urlpatterns = [
    #the main url
    # path('', views.index, name="index"),
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

    path('today_tasks/', user.today_tasks, name='today_tasks'),
    path('all_tasks/', user.all_tasks, name='all_tasks'),
    path('next_week_tasks/', user.next_week_tasks, name='next_week_tasks'),
]
