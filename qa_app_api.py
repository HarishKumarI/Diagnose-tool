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

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/test.db'
db = SQLAlchemy(app)


class User(db.Model):

	id = db.Column(db.Integer, primary_key=True)
	question = db.Column(db.String(20000), unique=False, nullable=False)
	answer = db.Column(db.String(20000), unique=False, nullable=True)
	failed_assoc_prob_list = db.Column(db.String(20000), unique=False, nullable=True)
	node_doc = db.Column(db.String(20000), unique=False, nullable=True)
	predicate_tuples = db.Column(db.String(20000), unique=False, nullable=True)
	ref_exp_nodes = db.Column(db.String(20000), unique=False, nullable=True)
	res_dict = db.Column(db.String(20000), unique=False, nullable=True)
	response = db.Column(db.String(20000), unique=False, nullable=True)
	results = db.Column(db.String(20000), unique=False, nullable=True)
	relevant = db.Column(db.Boolean, unique=False, nullable=True)
	comment = db.Column(db.String(20000), unique=False, nullable=True)
	submitted = db.Column(db.Boolean, unique=False, nullable=True)
	status = db.Column(db.String(20000), unique=False, nullable=True)
	timestamp = db.Column(db.String(20000), unique=False, nullable=True)
	user_id = db.Column(db.Integer, unique=False, nullable=False)
	username = db.Column(db.String(1024), unique=False, nullable=True)
	email = db.Column(db.String(20000), unique=False, nullable=True)
	state = db.Column(db.String(1024), unique=False, nullable=True)
	owner = db.Column(db.String(1024), unique=False, nullable=True)
	notes = db.Column(db.String(1024), unique=False, nullable=True)

	def __repr__(self):
		return '<User %r>' % self.username


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


		return jsonify({ 'isvalid': isvalid_user, 'username': username })    

	def fetch_dbdata(self):

		users = User.query.all()
		data = []
		for usr in users:
			u = vars(usr)
			del u['_sa_instance_state']
			data.append(u)
		return jsonify(data)

	def updateRow(self,request):
		data = request.get_json(force=True)
		id_no = data['id']
		print(data)
				
		row = User.query.filter_by(id = id_no).first()
		db.session.delete(row)
		db.session.commit()
		
		ans = data
		record = User(
				id = id_no,
				question = data["question"],
				answer = str(ans["answer"]),
				failed_assoc_prob_list = str(ans["failed_assoc_prob_list"]),
				node_doc = str(ans["node_doc"]) ,
				predicate_tuples = str(ans["predicate_tuples"]) ,
				ref_exp_nodes = str(ans["ref_exp_nodes"]),
				res_dict = ans["res_dict"],
				response = str(ans["response"]),
				results = str(ans["results"]),
				relevant = data["relevant"],
				comment = data["comment"],
				submitted = data["submitted"],
				status = data["status"],
				timestamp = data["timestamp"],
				user_id = int(data['user_id']) ,
				username = data['username'],
				email = data['email'],
				# state = data['state'],
				# owner = data['owner'],
				# notes = data['notes']
				)
		db.session.add(record)
		db.session.commit()
		
		return jsonify('success')


qa_agent = QaAgent()

@app.route('/api/verify',methods=['POST'])
def verify_user():
	if(request.method == 'POST'):
		return qa_agent.verify_user(request)


@app.route('/api/dbData',methods=['GET'])
def fetch_dbdata():
	if(request.method == 'GET'):
		return qa_agent.fetch_dbdata()

# @app.route('/updateRow',methods=['POST'])
# def updateRow():
# 	if(request.method == 'POST'):
# 		return qa_agent.updateRow(request)


if __name__ == '__main__':
	app.run(debug=False, port=7230,threaded=False,processes=1)
