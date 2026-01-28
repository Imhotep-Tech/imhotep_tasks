from django.contrib import admin
from .models import Tasks, User, Routines, ImhotepFinanceConnection


@admin.register(ImhotepFinanceConnection)
class ImhotepFinanceConnectionAdmin(admin.ModelAdmin):
    list_display = ('user', 'connected', 'scopes', 'expires_at', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('access_token', 'refresh_token', 'created_at', 'updated_at')
    raw_id_fields = ('user',)

    def connected(self, obj):
        return bool(obj.access_token)
    connected.boolean = True
    connected.short_description = 'Connected'


admin.site.register(Tasks)
admin.site.register(User)
admin.site.register(Routines)
