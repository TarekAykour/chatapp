release: python manage.py migrate
web: daphne chatapp.asgi:application --port 8000 --bind 0.0.0.0 -v2
worker: python manage.py runworker channels --settings=chatapp.settings -v2