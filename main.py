from flask import Flask, render_template, request, jsonify, redirect
import sys
import subprocess
import ast
import json

from flask_cors import CORS

import datetime

app = Flask(__name__)

#跨域访问flask的简单写法
CORS(app, supports_credentials=True)

#执行python代码，返回控制台信息
def run_python_code(code):
    result = subprocess.run(['python', '-c', code], text=True, capture_output=True)
    output = result.stdout.strip()
    return output

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/grammar')
def grammar():
    return render_template('grammar.html')

@app.route('/easyalgorithm')
def easyalgorithm():
    return render_template('easyalgorithm.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

#自习室，学生自己编程的网页
@app.route('/cubicle')
def cubicle():
    return render_template('cubicle.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    else:
        username = request.form.get('email')
        print(username)
        pwd = request.form.get('pwd')
        print(pwd)
        if username == '5icoding@sina.cn' and pwd == '888888':
            return redirect('/admin')
        else:
            return redirect('/login')

#管理员的测试路由
@app.route('/admin')
def admin():
    return "admin"

#flask应用中，执行python代码后，获得控制台返回信息
@app.route('/exec', methods=['POST'])
def run():
    # 从POST请求中获取用户输入的代码
    code = request.form['code']
    print(code)
    return run_python_code(code)

#协作编程跨域访问，执行python代码后，获得控制台返回信息
@app.route('/exec2', methods=['POST'])
def run2():
    # 从POST请求中获取用户输入的代码
    data = request.get_json(force=True)
    print(data['code'])
    result = run_python_code(data['code'])
    print(result)
    data = {'result': result}
    return jsonify(data)

#协作编程跨域访问保存
@app.route('/class/save', methods=['POST'])
def class_save():
    data = request.get_json(force=True)
    code = data['code']
    a = datetime.datetime.now()
    b = a.strftime('%Y-%m-%d-%H%M%S') 
    print(b)
    with open('class/'+ b + '.py', 'w') as f:
        f.write(code)  # 将字符串写入一个临时文件
    data = {'result': 'ok'}
    return jsonify(data)

if __name__ == '__main__':
    app.run(host='0.0.0.0',debug=True)