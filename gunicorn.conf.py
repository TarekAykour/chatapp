import multiprocessing

# Gunicorn configuration file for chatapp

# Number of worker processes
workers = multiprocessing.cpu_count() * 2 + 1

# Bind address and port
bind = "0.0.0.0:10000"

# Maximum number of requests a worker will process before restarting
max_requests = 1000

# Maximum number of simultaneous clients a worker will allow
worker_connections = 1000

# Timeout for worker processes to gracefully exit after receiving a SIGTERM signal
timeout = 30

# Gunicorn worker class for Django Channels
worker_class = "channels.worker.GunicornWorker"

# Path to your ASGI application object
# Replace "chatapp.asgi:application" with your actual ASGI application object location
# For example, if your ASGI application object is defined in "asgi.py" file and it's
# named "application", the value should be "asgi:application"
app_module = "chatapp.asgi:application"
