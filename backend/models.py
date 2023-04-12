from django.db import models
from datetime import datetime
from time import timezone
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now


# Create your models here.


# create user model

class User(AbstractUser):
    # profile_pic = models.ImageField(upload_to='media/', blank=True, null= True, default='')
    phone = models.CharField(max_length=11)
    friends = models.ManyToManyField("self", blank=True, related_name='friend', symmetrical=True)
    bio = models.CharField(max_length=255, blank=True, default='Hi! I am new to Socky!')
    profile_pic = models.ImageField(upload_to='media/',blank=True)
    def serialize(self):
        return {
            # "id": self.id,
            "username": self.username,
            "phone": self.phone,
            "bio": self.bio,
            # 'profile_pic': self.profile_pic,
            # "friends": self.friends,
            "email": self.email,
            "logged": self.is_authenticated
            
        }
    
    

# create chat model

# NOTE !
# we dont have a messages field. Because we can simply output all the messages
# in a certain chat by filtering out the message model by the id of thhe chat the message
# has been sent too.
# Same goes for key

class Chat(models.Model):
    users = models.ManyToManyField(User, related_name="chat_users")
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField()
    is_group = models.BooleanField(default=False)
    last_message = models.CharField(max_length=255, blank=True)
    
    def __str__(self):
        return self.title
    
    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "created_at": self.created_at,
            "updated": self.updated,
            "is_active": self.is_active,
            "sender": self.sender.username,
            "receive": self.receive.username,
            "date": self.date,
            "last_message": self.last_message,
            
        }

# create key model
class Key(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='keys')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    key = models.CharField(max_length=255)


class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.PROTECT, related_name="msg_sender")
    sender_username = models.CharField(max_length=255, default='')
    receiver = models.ForeignKey(User, on_delete=models.PROTECT, related_name="msg_receiver")
    receiver_username = models.CharField(max_length=255, default='')
    date = models.DateTimeField()
    content = models.CharField(max_length=255)
    # read = models.BooleanField()
    
    def __str__(self):
        return self.content
    
    def serialize(self):
        return {
            "chat": self.chat,
            "sender": self.sender,
            "sender_username": self.sender_username,
            "receiver": self.receiver,
            "receiver_username": self.receiver_username,
            "date": self.date,
            "content": self.content,

         }

# create groups model (messages as foreing key, i think)