from flask import Flask, request, Response, jsonify, send_file, send_from_directory
from flask_cors import CORS
from flask_restful import Resource, Api
import pandas as pd
import json

from flask_sqlalchemy import SQLAlchemy

import sqlalchemy

app = Flask(__name__)
api = Api(app)

CORS(app)

import os
import sys

id_data = pd.read_csv('user_ids.csv')

# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////home/harish/Webapps/ReactApps/diagnose-tool/user_log.db'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////home/komi/user_log.db'
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

	def verify_user(self,request):
		json_data = request.get_json(force=True)
		userid = json_data['userid']
		isvalid_user = False
		id_col = set(id_data['User ID'])
		username = ""

# 		print(userid)

		if int(userid) in id_col:
			if list(id_data.loc[id_data['User ID'] == int(userid)]['Tag'])[0] == 'CogniQA Staff':
				isvalid_user = True
			username = list(id_data.loc[id_data['User ID'] == int(userid)]['First Name'])[0]
		else:
			isvalid_user = False


		return jsonify({ 'isvalid': isvalid_user, 'username': username,"userid": int(userid) })    

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


qa_agent = QaAgent()

@app.route('/api/verify',methods=['POST'])
def verify_user():
	if(request.method == 'POST'):
		return qa_agent.verify_user(request)


@app.route('/api/dbData',methods=['POST'])
def fetch_dbdata():
	if(request.method == 'POST'):
		return qa_agent.fetch_dbdata()

@app.route('/api/updateRow',methods=['POST'])
def updateRow():
	if(request.method == 'POST'):
		return qa_agent.updateRow(request)


# For Getting UISettings JSON

@app.route('/api/uiSettings',methods=['GET'])
def uiSettings():
	with open('./src/uiSettings.json','r') as fp:
		return jsonify( json.load(fp) )

@app.route('/api/saveSettings',methods=['POST'])
def saveSettings():
	with open('./src/uiSettings.json','w') as fp:
		json.dump(request.get_json(force=True),fp,indent=4)
	return jsonify('success')


if __name__ == '__main__':
	app.run('0.0.0.0',debug=False, port=7230,threaded=False,processes=1)