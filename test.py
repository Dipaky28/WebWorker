# Importing flask module in the project is mandatory
# An object of Flask class is our WSGI application.
from flask import Flask, Response, send_from_directory

# Flask constructor takes the name of
# current module (__name__) as argument.
app = Flask(__name__, static_folder='build', static_url_path='/')

# The route() function of the Flask class is a decorator,
# which tells the application which URL should call
# the associated function.
@app.after_request
def add_headers(response):
    response.headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
    response.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
    return response
@app.route('/')
# ‘/’ URL is bound with hello_world() function.
def hello_world():
    return send_from_directory(app.static_folder, 'index.html')

# main driver function
if __name__ == '__main__':

	# run() method of Flask class runs the application
	# on the local development server.
	app.run(debug=True)
