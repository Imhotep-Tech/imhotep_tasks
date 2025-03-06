"""
URL configuration for imhotep_tasks project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

urlpatterns = [
    path('admin/', admin.site.urls),
]

from django.contrib import admin
from django.urls import path, include

# handler404 = 'polls_app.error_handle.handler404'
# handler500 = 'polls_app.error_handle.handler500'
# handler403 = 'polls_app.error_handle.handler403'
# handler400 = 'polls_app.error_handle.handler400'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('tasks.urls')),
]