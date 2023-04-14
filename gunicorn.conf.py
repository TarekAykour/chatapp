
bind = "0.0.0.0:8000"  # Replace with the appropriate bind address and port
worker_class = "channels.worker.GunicornWorker"  # Use the Gunicorn worker for Channels
