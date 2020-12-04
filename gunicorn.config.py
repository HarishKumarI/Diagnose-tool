bind = ['0.0.0.0:7230']

accesslog = './logs/gunicorn.log'
accesslogformat = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
# %(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"
errorlog = './logs/gunicorn.error.log'
capture_output = True
loglevel = 'debug'
workers = 2