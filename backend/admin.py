from django.contrib import admin

# Register your models here.


from django.contrib import admin
from .models import User, Chat,Key, Message
# Register your models here.



admin.site.register(User)
admin.site.register(Chat)
admin.site.register(Key)
admin.site.register(Message)