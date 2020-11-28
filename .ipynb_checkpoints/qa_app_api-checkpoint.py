from flask import Flask, request, Response, jsonify, send_file, send_from_directory
from flask_cors import CORS
import pandas as pd
import json

import sys

from flask_sqlalchemy import SQLAlchemy

import sqlalchemy

app = Flask(__name__)

CORS(app)

import redis
import pickle

import logging
import logging.handlers as handlers

import pymongo

mongo_uri = "mongodb://%s:%s@95.217.239.6:27777/admin"
mongo_database_url = "mongodb://95.217.239.6:27777"
mongo_common_db = "mydatabase"
mongo_database_table = "nlg_templates"
mongo_username = 'cognibot'
mongo_pwd = 'h3lloai..'

# logging.basicConfig(filename='demo.log', level=logging.DEBUG)

# logger = logging.getLogger()
# logger.setLevel(logging.INFO)
# formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')


# logHandler = handlers.RotatingFileHandler('diagnostic_tool.log', maxBytes=1024*1024*1024, backupCount=1)
# logHandler.setLevel(logging.DEBUG)
# logHandler.setFormatter(formatter)
# logger.addHandler(logHandler)


# sys.stdout.write = logger.info

import os
import sys

id_data = pd.read_csv('user_ids.csv')

# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////home/harish/Webapps/ReactApps/diagnose-tool/user_log.db'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////home/cognibot/user_log.db'
#app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////home/komi/user_log.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
db = SQLAlchemy(app)


# class User(db.Model):

# 	id = db.Column(db.Integer, primary_key=True)
# 	question = db.Column(db.String(20000), unique=False, nullable=False)
# 	answer = db.Column(db.String(20000), unique=False, nullable=True)
# 	failed_assoc_prob_list = db.Column(db.String(20000), unique=False, nullable=True)
# 	node_doc = db.Column(db.String(20000), unique=False, nullable=True)
# 	predicate_tuples = db.Column(db.String(20000), unique=False, nullable=True)
# 	ref_exp_nodes = db.Column(db.String(20000), unique=False, nullable=True)
# 	res_dict = db.Column(db.String(20000), unique=False, nullable=True)
# 	response = db.Column(db.String(20000), unique=False, nullable=True)
# 	results = db.Column(db.String(20000), unique=False, nullable=True)
# 	relevant = db.Column(db.Boolean, unique=False, nullable=True)
# 	comment = db.Column(db.String(20000), unique=False, nullable=True)
# 	submitted = db.Column(db.Boolean, unique=False, nullable=True)
# 	status = db.Column(db.String(20000), unique=False, nullable=True)
# 	timestamp = db.Column(db.String(20000), unique=False, nullable=True)
# 	user_id = db.Column(db.Integer, unique=False, nullable=False)
# 	username = db.Column(db.String(1024), unique=False, nullable=True)
# 	email = db.Column(db.String(20000), unique=False, nullable=True)
# 	state = db.Column(db.String(1024), unique=False, nullable=True)
# 	issue_type = db.Column(db.String(1024), unique=False, nullable=True)
# 	owner = db.Column(db.String(1024), unique=False, nullable=True)
# 	notes = db.Column(db.String(1024), unique=False, nullable=True)

# 	def __repr__(self):
# 		return '<User %r>' % self.username

# class Covid(db.Model):

# 	id = db.Column(db.Integer, primary_key=True)
# 	question = db.Column(db.String(20000), unique=False, nullable=False)
# 	answer = db.Column(db.String(20000), unique=False, nullable=True)
# 	failed_assoc_prob_list = db.Column(db.String(20000), unique=False, nullable=True)
# 	node_doc = db.Column(db.String(20000), unique=False, nullable=True)
# 	predicate_tuples = db.Column(db.String(20000), unique=False, nullable=True)
# 	ref_exp_nodes = db.Column(db.String(20000), unique=False, nullable=True)
# 	res_dict = db.Column(db.String(20000), unique=False, nullable=True)
# 	response = db.Column(db.String(20000), unique=False, nullable=True)
# 	results = db.Column(db.String(20000), unique=False, nullable=True)
# 	relevant = db.Column(db.Boolean, unique=False, nullable=True)
# 	comment = db.Column(db.String(20000), unique=False, nullable=True)
# 	submitted = db.Column(db.Boolean, unique=False, nullable=True)
# 	status = db.Column(db.String(20000), unique=False, nullable=True)
# 	timestamp = db.Column(db.String(20000), unique=False, nullable=True)
# 	statictics = db.Column(db.String(20000), unique=False, nullable=True)
# 	source = db.Column(db.String(20000), unique=False, nullable=True)
# 	source_link = db.Column(db.String(20000), unique=False, nullable=True)
# 	img_link = db.Column(db.String(20000), unique=False, nullable=True)
# 	user_id = db.Column(db.Integer, unique=False, nullable=False)
# 	username = db.Column(db.String(1024), unique=False, nullable=True)
# 	email = db.Column(db.String(20000), unique=False, nullable=True)
# 	state = db.Column(db.String(1024), unique=False, nullable=True)
# 	issue_type = db.Column(db.String(2000), unique=False, nullable=True)
# 	owner = db.Column(db.String(1024), unique=False, nullable=True)
# 	notes = db.Column(db.String(1024), unique=False, nullable=True)


# 	def __repr__(self):
# 		return '<User %r>' % self.username


class Univ_v2(db.Model):
 
	id = db.Column(db.Integer, primary_key=True)
	question = db.Column(db.String(20000), unique=False, nullable=False)
	answer = db.Column(db.String(20000), unique=False, nullable=True)
	format_query = db.Column(db.String(20000), unique=False, nullable=True)
	concept_nodes = db.Column(db.String(20000), unique=False, nullable=True)
	inv_index = db.Column(db.String(20000), unique=False, nullable=True)
	networkx_graph = db.Column(db.String(20000), unique=False, nullable=True)
	pred_tuples = db.Column(db.String(20000), unique=False, nullable=True)
	sem_parse_out = db.Column(db.String(20000), unique=False, nullable=True)
	results = db.Column(db.String(20000), unique=False, nullable=True)
	plot_json = db.Column(db.String(20000), unique=False, nullable=True)
	text = db.Column(db.String(20000), unique=False, nullable=True)
	relevant = db.Column(db.Boolean, unique=False, nullable=True)
	comment = db.Column(db.String(20000), unique=False, nullable=True)
	submitted = db.Column(db.Boolean, unique=False, nullable=True)
	status = db.Column(db.String(20000), unique=False, nullable=True)
	timestamp = db.Column(db.String(20000), unique=False, nullable=True)
	source = db.Column(db.String(20000), unique=False, nullable=True)
	source_link = db.Column(db.String(20000), unique=False, nullable=True)
	img_link = db.Column(db.String(20000), unique=False, nullable=True)
	user_id = db.Column(db.Integer, unique=False, nullable=False)
	username = db.Column(db.String(1024), unique=False, nullable=True)
	email = db.Column(db.String(20000), unique=False, nullable=True)
	state = db.Column(db.String(1024), unique=False, nullable=True)
	issue_type = db.Column(db.String(2000), unique=False, nullable=True)
	owner = db.Column(db.String(1024), unique=False, nullable=True)
	notes = db.Column(db.String(1024), unique=False, nullable=True)
	statictics = db.Column(db.String(20000), unique=False, nullable=True)
	version = db.Column(db.String(20000), unique=False, nullable=True)

	def __repr__(self):
		return '<User %r>' % self.username


class Covid_v2(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String(20000), unique=False, nullable=False)
    answer = db.Column(db.String(20000), unique=False, nullable=True)
    format_query = db.Column(db.String(20000), unique=False, nullable=True)
    concept_nodes = db.Column(db.String(20000), unique=False, nullable=True)
    inv_index = db.Column(db.String(20000), unique=False, nullable=True)
    networkx_graph = db.Column(db.String(20000), unique=False, nullable=True)
    pred_tuples = db.Column(db.String(20000), unique=False, nullable=True)
    sem_parse_out = db.Column(db.String(20000), unique=False, nullable=True)
    results = db.Column(db.String(20000), unique=False, nullable=True)
    plot_json = db.Column(db.String(20000), unique=False, nullable=True)
    text = db.Column(db.String(20000), unique=False, nullable=True)
    relevant = db.Column(db.Boolean, unique=False, nullable=True)
    comment = db.Column(db.String(20000), unique=False, nullable=True)
    submitted = db.Column(db.Boolean, unique=False, nullable=True)
    status = db.Column(db.String(20000), unique=False, nullable=True)
    timestamp = db.Column(db.String(20000), unique=False, nullable=True)
    source = db.Column(db.String(20000), unique=False, nullable=True)
    source_link = db.Column(db.String(20000), unique=False, nullable=True)
    img_link = db.Column(db.String(20000), unique=False, nullable=True)
    user_id = db.Column(db.Integer, unique=False, nullable=False)
    username = db.Column(db.String(1024), unique=False, nullable=True)
    email = db.Column(db.String(20000), unique=False, nullable=True)
    state = db.Column(db.String(1024), unique=False, nullable=True)
    issue_type = db.Column(db.String(2000), unique=False, nullable=True)
    owner = db.Column(db.String(1024), unique=False, nullable=True)
    notes = db.Column(db.String(1024), unique=False, nullable=True)
    statictics = db.Column(db.String(20000), unique=False, nullable=True)
    version = db.Column(db.String(20000), unique=False, nullable=True)


    def __repr__(self):
        return '<User %r>' % self.username

# change values according to classes
classObj = { "University": Univ_v2, "Covid": Covid_v2 }
# classObj = {"University": User, "Covid": Covid}

class QaAgent(object):
	"""docstring for QaAgent"""
	def __init__(self):
		super().__init__()
		self.mongo_client = pymongo.MongoClient(mongo_uri % (mongo_username, mongo_pwd))

		self.uiSettingsJson = {}
		with open('./src/uiSettings.json','r') as fp:
			self.uiSettingsJson = json.load(fp)

	def verify_user(self,request):
		json_data = request.get_json(force=True)
		userid = json_data['userid']
		isvalid_user = False
		id_col = set(id_data['User ID'])
		userdata = None

		rows = list( self.mongo_client['admin'].user_login.find({ "id": userid}) )
        
		if len( rows ) > 0 :
			isvalid_user = True
			userdata = rows[0]
			del userdata['_id']


		# if int(userid) in id_col:
		# 	if list(id_data.loc[id_data['User ID'] == int(userid)]['Tag'])[0] == 'CogniQA Staff':
		# 		isvalid_user = True
		# 	username = list(id_data.loc[id_data['User ID'] == int(userid)]['First Name'])[0]
		# else:
		# 	isvalid_user = False


		return jsonify({ 'isvalid': isvalid_user, 'userdata': userdata,"userid": int(userid) })    

	def fetch_dbdata(self):

		json_data = request.get_json(force=True)

		tableData = classObj[json_data['domain']].query.all()

		data = []
		for row in tableData:
			u = vars(row)
			del u['_sa_instance_state']
			data.append(u)
		return jsonify(data)

	def updateRow(self,request):
		data = request.get_json(force=True)
		domain = data['domain']

		del data['domain']
		id = int(data['id'])
		row = classObj[domain].query.filter_by(id = id).first()

		for key,value in data.items():
			print(key,type(value))
			if key in ["user_id","id"] :
				setattr(row,key,int(value))
			else :
				setattr(row,key,value)
		db.session.commit()
		
		return jsonify('success')
	
	def uiSettings(self):
		return jsonify(	self.uiSettingsJson )

	def SaveuiSettings( self, request ):
		self.uiSettingsJson = request.get_json(force=True)

		with open('./src/uiSettings.json','w') as fp:
			json.dump(request.get_json(force=True),fp,indent=4)
		return jsonify('success')


	def ChatFeedbacks(self, request):
		r = redis.Redis(host='localhost', port=6379, db=0)
		res = r.keys()
		session_list = []
		for x in res:
			ses = x.decode('utf-8')

			if ses.startswith('session:') :
				ses_res_pkl = r.get(ses)
				ses_res = pickle.loads(ses_res_pkl)

				for session in ses_res.get('history', []):
					if 'inference_output' in session and session['inference_output'] != None:
						for i,el in enumerate(session['inference_output']):
							try:
								session['inference_output'][i]['G'] = None
							except:
								session['inference_output']['G'] = None
				
				
				session_list.append({
					'session_id': ses[8:],
					'user_id': ses_res.get('user_id', None),
					'created_at': ses_res.get('created_at', None),
					'feedbacks': [ row['feedback'] if 'feedback' in row else None for row in ses_res.get('history', [])  ],
					'history': ses_res.get('history', None)
				})
				
		sessions = []
		for session in session_list:
			try:
				sessions.append( json.dumps(session) )
			except:
				pass

		return jsonify({ "msg": "success", "data": sessions })


qa_agent = QaAgent()

# QA Feedback
@app.route('/api/verify',methods=['POST'])
def verify_user():
	if request.method == 'POST' :
		return qa_agent.verify_user(request)


@app.route('/api/dbData',methods=['POST'])
def fetch_dbdata():
	if request.method == 'POST' :
		return qa_agent.fetch_dbdata()

@app.route('/api/updateRow',methods=['POST'])
def updateRow():
	if request.method == 'POST' :
		return qa_agent.updateRow(request)


# Chat Feedback
@app.route('/api/chatDbData', methods=['POST'])
def ChatFeedbacks():
	if request.method == 'POST':
		return qa_agent.ChatFeedbacks( request )


@app.route('/api/dev_feedback', methods=['POST'])
def developerFeedback():
    if request.method == 'POST':
        r = redis.Redis(host='localhost', port=6379, db=0)
        data = request.get_json(force=True)
        session_id = data['session_id']
        history_value = data['history']
        res = r.get('session:'+session_id)    # replace with cookie
        result = pickle.loads(res)
        result['history'] = history_value
        try:
            r.set('session:'+session_id, pickle.dumps( result ) )
            return jsonify({ "msg": 'success' })
        except:
            return jsonify({"msg":'error'})
    else:
        return jsonify({})

# For Getting UISettings JSON

@app.route('/api/uiSettings',methods=['GET'])
def uiSettings():
	return qa_agent.uiSettings()

@app.route('/api/saveSettings',methods=['POST'])
def saveSettings():
	return qa_agent.SaveuiSettings( request )

        

if __name__ == '__main__':
	app.run('0.0.0.0',debug=True, port=7230,threaded=False,processes=1)
