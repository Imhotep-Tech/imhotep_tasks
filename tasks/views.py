from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.urls import URLResolver, URLPattern
from django.urls import get_resolver
import datetime
from django.conf import settings
import os
from django.views.decorators.cache import cache_control

# Create your views here.

#the main URL
def index(request):
    #if the user is logged in redirect to his dashboard
    if request.user.is_authenticated:
        return redirect('today_tasks')
    #if he is not logged in redirect to the login page
    else:
        return redirect('landing_page')

def landing_page(request):
    return render(request, 'landing.html')

def terms(request):
    return render(request, 'terms.html')

def privacy(request):
    return render(request, 'privacy.html')

def version(request):
    return render(request, 'version.html')

def download(request):
    return render(request, 'download.html')

def get_url_pattern(pattern):
    """Helper function to get the URL pattern string"""
    if hasattr(pattern, 'pattern'):
        if hasattr(pattern.pattern, '_route'):
            return pattern.pattern._route
        elif hasattr(pattern.pattern, '_regex'):
            return pattern.pattern._regex.replace('^', '').replace('$', '')
    return ''

def get_all_urls(resolver=None, prefix=''):
    """Recursively get all URLs from URL patterns"""
    if resolver is None:
        resolver = get_resolver()

    urls = []
    for pattern in resolver.url_patterns:
        if isinstance(pattern, URLResolver):
            pattern_prefix = get_url_pattern(pattern)
            urls.extend(get_all_urls(pattern, prefix + pattern_prefix))
        elif isinstance(pattern, URLPattern):
            pattern_path = get_url_pattern(pattern)
            if pattern_path and '<' not in pattern_path:  # Skip URLs with parameters
                urls.append(prefix + pattern_path)
    return urls

def sitemap(request):
    """Generate sitemap.xml"""
    pages = []
    domain = settings.SITE_DOMAIN.rstrip('/')  # Remove trailing slash if present
    ten_days_ago = (datetime.datetime.now() - datetime.timedelta(days=10)).date().isoformat()

    # Get all URLs
    urls = get_all_urls()

    # Add URLs to pages list
    for url in urls:
        if url.startswith('/'):
            full_url = domain + url
        else:
            full_url = domain + '/' + url
        pages.append([full_url, ten_days_ago])

    # Add any additional static URLs you want to include
    static_urls = [
        '/about/',
        '/contact/',
        # Add more static URLs as needed
    ]

    for url in static_urls:
        full_url = domain + url
        pages.append([full_url, ten_days_ago])

    # Render the sitemap
    sitemap_xml = render(request, 'sitemap.xml', {'pages': pages})

    # Return with correct content type
    return HttpResponse(sitemap_xml, content_type='application/xml')

@cache_control(max_age=0)
def service_worker(request):
    response = HttpResponse(
        open(os.path.join(settings.STATIC_ROOT, 'service-worker.js')).read(),
        content_type='application/javascript'
    )
    return response

def offline(request):
    return render(request, 'offline.html')