# chat/consumers.py
import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from .models import User,Message,Chat
from django.contrib.auth.decorators import login_required
import datetime
from channels.layers import get_channel_layer
from django.core import serializers


# we can import this class and its method in the views.py
# and execute our preferred method


class ChatConsumer(WebsocketConsumer):
   
    def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = "chat_%s" % self.room_name
   
        # restrict users from accessing chat if not inside chat

        
        group_name = self.room_group_name
        
        # check if group (chat) exists
        if Chat.objects.filter(title=group_name.replace("chat_", "")).exists():
            
            async_to_sync(self.channel_layer.group_add)(
                self.room_group_name, self.channel_name
            )
             # get all messages from chat
            chat = Chat.objects.get(
                id=self.scope['url_route']['kwargs']['chat_id'],
                title=self.scope['url_route']['kwargs']['room_name']
                )
            if not chat:
                self.close()
                return 
            
            if not self.scope['user'].is_authenticated or self.scope['user'].username not in chat.users.values_list('username', flat=True):
                self.close()
                return



            messages = list(Message.objects.filter(chat=chat).values(
                'chat',  
                'sender_username',
                'receiver_username',
                'content',
                
                ))
            # check if user is inside chat
            # connect to chat
            self.accept()

                # send messages to js
            self.send(text_data=json.dumps({
                    'prevMessages': messages
                }))
          
            

        else:
            print('non existent')
            async_to_sync(self.channel_layer.group_add)(
                self.room_group_name, self.channel_name
            )   

    # disconnect from group
    def disconnect(self, close_code):
        # get chat
        # update the chat is active to false
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )
        print('user left')
        

    # Receive message from websocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        sender = text_data_json["sender"]
        receiver = text_data_json["receiver"]

        sender = User.objects.get(username=sender)
        receiver = User.objects.get(username=receiver)

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {
            "type": "chat_message", 
            "message": message, 
            "sender": sender.username,
            "receiver": receiver.username
            }
        )


    # Receive message from room group
    def chat_message(self, event):
        # getting the data from js (form)
        message = event['message']
        sender = event['sender']
        receiver = event['receiver']

        # getting the data from database
        sender = User.objects.get(username=sender)
        receiver = User.objects.get(username=receiver)
        chat = Chat.objects.get(id=self.scope["url_route"]["kwargs"]["chat_id"], title=self.scope["url_route"]["kwargs"]["room_name"])
        
        # create message in database
        if not Message.objects.filter(chat=chat, sender=sender,date=datetime.datetime.now(), content=message).exists():
            if len(message.strip()) >= 1:
                # update last message
                chat.last_message = message
                chat.save()
                
                # check if sender is equal to logged in user. 
                # then save it 
                if sender == self.scope['user']:
                    Message.objects.get_or_create(
                    chat=chat,
                    sender=sender,
                    sender_username=sender.username, 
                    receiver=receiver,
                    receiver_username=receiver.username,
                    date=str(datetime.datetime.now()) ,
                    content=message)
               
                # send message to websocket
                self.send(text_data=json.dumps({
                    'message': message, 
                    'sender': sender.username, 
                    'receiver': receiver.username
                    }))
            else:
                self.send(text_data=json.dumps({
                    'message': 'empty field!' 
                }))

