import multiprocessing


bind = "0.0.0.0:8000"  # Replace with the appropriate bind address and port
workers = multiprocessing.cpu_count() * 2 + 1  # Use recommended number of workers for CPU cores
worker_class = "channels.worker.GunicornWorker"  # Use the Gunicorn worker for Channels
