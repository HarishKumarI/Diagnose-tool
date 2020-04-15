from flask import Flask, request, Response, jsonify, send_file, send_from_directory
from flask_cors import CORS
from flask_restful import Resource, Api
import pandas as pd
import json

app = Flask(__name__)
api = Api(app)

CORS(app)

import os
import sys

id_data = pd.read_csv('user_ids.csv')

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
		with open('qa_data_usr_23075.json','r') as fp:
			return jsonify(json.load(fp))

	def updateRow(self,request):
		json_data = request.get_json(force=True)

		id = json_data['id']
		with open('qa_data_usr_23075.json','r') as fp:
			dbdata = json.load(fp)

		dbdata[id - 1 ] = json_data
		with open('qa_data_usr_23075.json','w') as fp:
			json.dump(dbdata,fp,indent=4)

		return jsonify('success')




qa_agent = QaAgent()

@app.route('/verify',methods=['POST'])
def verify_user():
	if(request.method == 'POST'):
		return qa_agent.verify_user(request)


@app.route('/dbData',methods=['GET'])
def fetch_dbdata():
	if(request.method == 'GET'):
		return qa_agent.fetch_dbdata()

@app.route('/updateRow',methods=['POST'])
def updateRow():
	if(request.method == 'POST'):
		return qa_agent.updateRow(request)


if __name__ == '__main__':
	app.run(debug=False, port=7230,threaded=False,processes=1)
