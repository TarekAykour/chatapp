from django.urls import path
from .views import index


urlpatterns = [
    path('', index),
    path('login', index),
    path('register', index),
    path('profile/<str:username>', index),
    path('friends', index),
    path('chat/<str:title>/<int:chat_id>', index),
    path('chats', index),
    path('about', index)
]