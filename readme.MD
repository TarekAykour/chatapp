# Chatapp (Django, Django Channels, React)


## The setup

I set the project up using Django for the backend and react for the frontend. Because of the easy usage and rapid development of Django and the usage
of webcomponents. I installed all the ibraries such as babel, react-dom, cors-headers (for django), etc. So i don't have to worry about missing any tool
that i will eventually need later into development.

## Login and Signup

We start off with login and signup so, we can authenticate users and redirect them to certain pages.
We use the **Abstractuser** model to create an user model. We'll manually add email phone, password and username verification. The data will be stored in a **Sqlite3** Database

## Getting the user

## Searchbar implementation
`messages = Message.objects.filter(
            Q(content__icontains=query) and
            Q(sender_username=request.user.username) or
            Q(receiver_username=request.user.username)
        )`

## Adding friends

Adding friends seemed to be a straight forward task:

- check if user exists
- check if user _not_ in friendslist
- add friend
  I first tried to implement the functionality in the same view
  as where i get the profile of the user. But this seemed like a bad idea since i got a `HttpResponse` error. So the better way is to make two seperate views: 1 for adding and 1 for removing.
  We essentially check if the client is logged in then check if the user the client wants to add is already in the friendslist and if the user exists. if these conditions were true and-/or false (user shouldnt be in friendslist, so it should be false) then add the user.

In React we simply got the profile data and checked if **is_friend=true** or false. If false then display the "+" icon otherwise the "-".

## Initiating chat

- Client goes to profile of user
- Client clicks on the message icon
- When clicked a new chat gets started
- [OPTIONALLY] we can send a chat request first to user
- if user accepts then start the chat
- otherwise rejected and we delete the chat instance
- The chat instance will be initiated with client and user as users, the clicked on user as the title and viceversa. Or we can define title. (not that relevant now)
- and datetime.
- for the websocket we initialize it as we initialize the chat model entry
- As well as the room url.  the chat will have an url starting with '/ws', to differentiate the websocket server from the backend server. So when making post requests for the messages. We use '/backend/ws/chat_id' to send a message to a specific chat. User should only be able to do this when: 1. he is logged in and 2. when he's inside the users list of the chat. 
- User admin of the chat should also be able to add other users to chat. So essentially each chat is a group chat between two users and users can be added.  




## Chat Part 2
We don't need to define anything in the views.py. We simply create our message inside the consumer.py, because we're dealing with a websocket request and not a HTTP request. Hence why we don't use **fetch** to *post* data, but instead use the *websocket* module in JS. 





## The messages

- name of person who's send the message should be displayed in the message (like in whatsapp). Although this could be skipped when having 1 on 1 convo. 




### steps with Django channels

- Follow the tutorial
- At the route.py do the following: `websocket_urlpatterns = [
    path("ws/<room_name>/<chat_id>/", consumer.ChatConsumer.as_asgi()),
]`



application = ProtocolTypeRouter({
    'websocket':
    URLRouter(
        websocket_urlpatterns
    )
})`` 

make sure that `path("ws/<room_name>/<chat_id>/")` to `const chatSocket = new WebSocket(`ws://${window.location.host}/ws/${username}/33/`)` in your js file. Now it's equal. 
**Note**: you do not need to specify the *backend* url. Websockets are different. 


If you got `CHANNEL_LAYERS = {
    'default': {
        'BACKEND': "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("127.0.0.1", 8000)]
        }
        }
    }`
Inside your *settings.py*, **remove it** when testing. This shit comes later. 






### Chat frontend

I used the **fetch** to get the chat data. I then saved the data inside **localstorage** and *history.push()* to get to the chat and display the data like: username, chat id and room name



### websocket frontend


### websocket backend



### Marking chat message read or unread


### sending all previous messages to frontend
I added the username of the sender and receiver inside the model.
When user sends the message their username will be added to the query.
We then retrieve all messages of the current chat. By first getting the current chat 
` chat = Chat.objects.get(
                id=self.scope['url_route']['kwargs']['chat_id'],
                title=self.scope['url_route']['kwargs']['room_name']
                )`

Then create a list of messages with the values
`messages = list(Message.objects.filter(chat=chat).values(
                'chat',  
                'sender_username',
                'receiver_username',
                'content'
                ))`



### Last message
We want to display the last message of the chat in our chats page and home page along with the chatname and user. 
The first option is to update the chat last message to the most recent message sent in the chat.
Option two is to filter all the messages and set each last message of the chat corresponding with the chat of the message to the message['content']. 

We simply assing chat.last_message to the message
then save 

`chat.last_message = message`

`chat.save()`



### Getting users from chats 
Getting users from chat where the *request.user* is part of the chat.
I first tried to `list(chats.values())` to get all the values of the chat. But it didn't include the users.
Secon approach was to loop through each chat and get all the users and place them in an object with the chat id as the key and the array of users as the value. Then i would have to compare each id with the chat.id and append the users in a new chat object wheren the rest of the values are. This solution seemed to impractical and guarentees spaghetti code. My last approach was to inline loop through the chats and create an object for each chat. Here i could access the chat.users. But another error occured. When i wrote: `'users': chat.users` it first gave me this error: *TypeError: Object of type ManyRelatedManager is not JSON serializable*. Then i tried to do `'users': [chat.users]` which gave me the same error. Then i tried `list(chat.users)` which gave me *ManyRelatedManager object is not iterable*. Finally i used my head got the all the usernames of the users: `'users': list(chat.users.values('username'))`. 


### restricting users from chat
inside the consumer.py we will first check if user is authenticated
`if not self.scope['user'].is_authenticated or self.scope['user'].username not in chat.users.values_list('username', flat=True):`



### sending messages only once
I had a problem. I was saving the message twice when two users connected to the same chat.
Luckily this was a simple fix. I checked wether the sender is the logged in user.
If so, then i'd save the chat message. This saves it only once, since the receiver is not the user in *self.scope['user']*. 

**The code**
`if sender == self.scope['user']:`




### Getting all chats
I used an HTTP request to retrieve all the chats the user was in.
Inside the *views.py* i made a simple query:

`if request.method == 'GET':
        # get all chats where user is in
        chats = Chat.objects.filter(users=request.user)
        print(request.user)
        return JsonResponse({"chats": list(chats.values())}, status=200)
        `
we get all the values and then convert to list, otherwise we will get a queryset which is not serializable. 

When you get an error from another view then:
Change the API urls. In our case we had:
`path("<str:username>", views.profile, name="self"),`
to get the profile of an user and 
`path('allchats', views.all_chats, name='allchats')`
to access all the chats. Now the problem is that it will see 'allchats'
as an username. So then  your profile view will initiate instead of your all_chats view. So change the order (all_chats first) or simply add another paramter like 'user' like so: `path("user/<str:username>", views.profile, name="self"),`.

In the chats page we will also add pagination. We can either use the django paginator or the react one. 
we will import the following: `from django.core.paginator import Paginator`


### serialize imagefield
import the following: 

`from django.db import models`

`import base64`

`from io import BytesIO`

`from PIL import Image`



