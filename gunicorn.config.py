bind = ['0.0.0.0:7231']

accesslog = './logs/gunicorn.log'
accesslogformat = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'
errorlog = './logs/gunicorn.error.log'
capture_output = True
loglevel = 'debug'
workers = 1