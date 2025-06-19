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
from django.urls import path, include
from tasks.views import sitemap, service_worker, offline
from tasks import views
from imhotep_tasks.settings import DEBUG

handler401 = 'tasks.error_handle.handler401'
handler405 = 'tasks.error_handle.handler405'
handler408 = 'tasks.error_handle.handler408'
handler429 = 'tasks.error_handle.handler429'
handler502 = 'tasks.error_handle.handler502'
handler503 = 'tasks.error_handle.handler503'
handler504 = 'tasks.error_handle.handler504'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('tasks.urls')),
    path('sitemap.xml', sitemap, name='sitemap'),
    path('service-worker.js', service_worker, name='service-worker'),
    path('offline.html', offline, name='offline'),

]
