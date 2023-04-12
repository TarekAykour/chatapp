from django.urls import path
from . import views

urlpatterns = [
    path('register', views.register, name="register"),
    path('login', views.login_view, name="login"),
    path('logout', views.logout_view, name="logout"),
    path("user", views.current_user, name="user"),
    path("search", views.search, name="search"),
    path("friends", views.show_friends, name="friendsList"),
    path("user/<str:username>", views.profile, name="self"),
    path("add_friend/<str:username>", views.add_friend, name="addFriend"),
    path("remove_friend/<str:username>", views.remove_friend, name="removeFriend"),
    path("<str:username>/create_chat", views.create_chat, name="create_chat"),
    path('allchats', views.all_chats, name='allchats'),
    path('user/bio/<str:username>', views.profile, name="user")
]
