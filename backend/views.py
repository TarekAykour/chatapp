from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from .models import User, Chat, Key
import json
import random
from django.core.paginator import Paginator
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
# The Q object is used to build complex queries in Django.
#  It allows you to combine multiple WHERE clauses using OR and AND operators.
from django.db.models import Q
from .models import User,Chat,Message
import base64
from PIL import Image
from io import BytesIO
# Create your views here.



@login_required
def home(request):
     pass



# or we could just send all the messages from/to the user + all users (except admin)
# in one results 

@login_required
@csrf_protect
def search(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        query = data.get('search')
        results = {
            'messages': [],
            'groups': [],
            'people': []
        }

        # search through messages
        messages = Message.objects.filter(
            Q(content__icontains=query) and
            Q(sender_username=request.user.username) or
            Q(receiver_username=request.user.username)
        )
        for message in messages:
            results['messages'].append({
                'content': message.content,
                'group_name': message.chat.title,
                'group_id': message.chat.id
            })

        # search through groups
        # groups = Group.objects.filter(
        #     Q(name__icontains=query)
        # )
        # for group in groups:
        #     results['groups'].append({
        #         'name': group.name,
        #         'description': group.description
        #     })

        # search through people
        people = User.objects.filter(
            Q(username__icontains=query)
        )
        for person in people:
            if not person.is_superuser and not person.is_staff:
                results['people'].append({
                'name': person.username
                })

        return JsonResponse(results, status=200)


# accept/rejecting friend request
@login_required
def friend_request(request):
    pass


# all friends
@login_required
def show_friends(request):
    friends = request.user.friends.all()
    friends_list = []
    for friend in friends:
        if not friend.is_superuser:
            friends_list.append({'name': friend.username, 'pic': str(friend.profile_pic)})
    
    return JsonResponse({"friends": friends_list}, status=200)




# create chat
# websocket will get the chat and create the chat server
@login_required
def create_chat(request,username):
    if request.method == 'POST':
        data = json.loads(request.body)
        initiater = User.objects.get(username=data.get('initiater'))
        responder = User.objects.get(username=username)
        title = ''
        chars = 'abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        for i in range(6):
            title += random.choice(chars)

        # Check if users are already in the same chat
        chat = Chat.objects.filter(users=initiater).filter(users=responder).first()
        if chat:
            print(chat.title, initiater, responder)
            return JsonResponse({'message':'redirecting to chat...','title': chat.title,'chat_id': chat.id, 'users': {'initiater': initiater.username, 'responder': responder.username}},status=200)
        
        elif not chat and not Chat.objects.filter(title=title).exists():
            chat = Chat.objects.create(title=title,is_active= True)
            chat.users.add(responder.id,initiater.id)
            return JsonResponse({'message':'chat created','title': title,'chat_id': chat.id, 'users': {'initiater': initiater.username, 'responder': responder.username}},status=200)
        else:
            return JsonResponse({'error': 'chat can not be created'}, status=400)
    else:
        return JsonResponse({'error':'invalid'}, status=400)
 
        

# delete chat
@login_required
def delete_chat(request,chat):
    pass


# get all the chats, logged in user is in
@login_required
def all_chats(request):
    if request.method == 'GET':
        # get all chats where user is in
        chats = Chat.objects.filter(users=request.user)
        pagination = Paginator(chats,10)
        page_number = request.GET.get('page')
        page_obj = pagination.get_page(page_number)
        # for chat in chats:
        #     for user in chat.users.all():
        #         print(user)
            
       
        return JsonResponse( [{
            'id': chat.id,
            'title':chat.title, 
            'last_message': chat.last_message,
            'created_at': str(chat.created_at.strftime('%d/%m/%y')),
            'users': list(chat.users.values('username'))
            
            }
                for chat in chats
                ], status=200, safe=False)
    
    else:
        return JsonResponse({"error": "invalid request"}, status=400)


# logout
@login_required
@ensure_csrf_cookie
def logout_view(request):
    if request:
        logout(request)
        return JsonResponse({"message": "logged out!"}, status=200)
    else:
        return JsonResponse({"error": "Not logged in!"}, status=400)
    

# get current user
@login_required
def current_user(request):
    user = request.user
    if not request.user.is_anonymous and request.user.is_authenticated:
        return JsonResponse(user.serialize(),status=200)
    else:
        return JsonResponse({"error": "no user"},status=400)
    

# get profile



@login_required
def profile(request, username):    
    if request.method == 'GET':
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return JsonResponse({"error": "user not found"}, status=404)
        is_friend = request.user.friends.filter(username=username).exists()
        return JsonResponse({
            "user": user.username, 
            "bio": user.bio, 
            # 'pic': base64.b64encode(user.profile_pic).decode('utf-8'),
            "isFriend": is_friend, 
            "friends": user.friends.count()
        }, status=200)
    
    if request.method == 'POST':
        if username == request.user.username:
            data = json.loads(request.body)
            bio = data.get('bio')
            pic = data.get('pic')
            
            # change bio
            if bio and len(bio.strip()) >= 1:
                user = User.objects.get(username=request.user.username)
                user.bio = bio
                user.save()
                return JsonResponse({"message": "bio changed"}, status=200)
            else:
                return JsonResponse({"error": "couldn't change bio"}, status=400)

            # change profile pic
            
    else:
        return JsonResponse({"error": "No valid request"}, status=400)
    


@login_required
def add_friend(request, username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    
    if request.method == 'POST':
        data = json.loads(request.body)
        addUsr = data.get('action')
        if addUsr:
            if user and request.user not in user.friends.all() and request.user != user:
                user.friends.add(request.user)
                return JsonResponse({"message": "friend added!"}, status=200)
        else:
            print(f"user not added")
            return JsonResponse({"error": "User not added'"})
    else:
        return JsonResponse({"error": "invalid request"}, status=404)
        
        


@login_required
def remove_friend(request, username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    
    if request.method == 'POST':
        data = json.loads(request.body)
        removeUsr = data.get('action')
        if removeUsr:
            if user and request.user in user.friends.all() and request.user != user:
                user.friends.remove(request.user)
                return JsonResponse({"message": "user removed"}, status=200)
            else:
                print(f"user not removed!")
                return JsonResponse({"error": "user not removed"}, status=400)
        else:
            return JsonResponse({"error": "rmuser not in post"}, status=400)
    else:
        return JsonResponse({"error": "not POST request"}, status=400)


   

@ensure_csrf_cookie
def login_view(request):
    if request.method == "POST":
         data = json.loads(request.body)
         # Attempt to sign user in
         username = data.get("username")
         password = data.get("password")
         user = authenticate(request, username=username, password=password)
         # Check if authentication successful
         if user is not None or user:
             login(request, user)
             return JsonResponse({"message": "User logged in!"}, status=200)
         else:
             return JsonResponse({"error": "Invalid username and/or password."}, status = 400)
      
    else:
        return JsonResponse({"error": "not post request"},status=400)



@ensure_csrf_cookie
def logout_view(request):
    if request:
        logout(request)
        return JsonResponse({"message": "logged out!"}, status=200)
    else:
        return JsonResponse({"error": "Not logged in!"}, status=400)


# register
@ensure_csrf_cookie
def register(request):
    if request.method == "POST":
         data = json.loads(request.body)
         username = data.get("username")
         email = data.get("email")
         phone = data.get("phone")
         # Ensure password matches confirmation
         password = data.get("password")
         confirmation = data.get("confirmation")
        #  profile_pic = data.get("profilepic")

      
    


        # check if fields are filled
         if not username or len(username) < 4 or len(username.strip()) < 4:
                return JsonResponse({"error": "Username should be at least 4 characters long"}, status=400)
         
         elif not email or len(email) < 9 or len(email.strip()) < 12:
                return JsonResponse({"error": "Email not valid"}, status=400)
         
         elif not phone or len(phone) < 9 or len(phone.strip()) < 8:
                return JsonResponse({"error": "Phone number invalid"},status=400)
         
         elif not password or len(password) < 6 or not password.strip() or len(password.strip()) < 6:
                return JsonResponse({"error":"pasword too short"}, status=400)
         
         elif password != confirmation:
               return JsonResponse({"error":"paswords do not match"}, status=400)
         

        #  check if email and username exists
         elif username in User.objects.all() or email.strip() in User.objects.all() or phone.strip() in User.objects.all():
            return JsonResponse({"error": "user already exists"}, status=400)
         

        #  create user
         else:
           user = User.objects.create_user(username, email, phone=phone, password=password)
           user.save()
           login(request,user)
           return JsonResponse({"message": "user created"}, status=200)
        
          
    else:
        return JsonResponse({"error": "not post"}, status=400)
         