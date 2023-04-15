from django.urls import re_path, path
from . import consumer
from channels.routing import ProtocolTypeRouter, URLRouter



# the route
# the path is gonna be ws/chat_id 
# each chat will be created when the user sends a message to their friend
# the chat will have (id, 
# message,
# users, 
# timestamps for each chat and options to delete the chat)
# also options like (view user you're chatting to, delete (deletes chat only for the current user))
websocket_urlpatterns = [
    # re_path(r"ws/(?P<room_name>\w+)/$", consumer.ChatConsumer.as_asgi()),
    path("wss/<room_name>/<chat_id>/", consumer.ChatConsumer.as_asgi()),
]



application = ProtocolTypeRouter({
    'websocket':
    URLRouter(
        websocket_urlpatterns
    )
})