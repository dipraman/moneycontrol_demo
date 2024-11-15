from flask import Flask, request
import subprocess

app = Flask(__name__)
counter = 0

@app.route('/run-server')
def run_server():
    global counter
    try:
        # Pass the counter value to server1.py
        subprocess.run(["python", "server1.py", str(counter)]) # Adjust command as needed'
        print("Counter Value:",counter)
        # Increment the counter
        counter += 1
        # Reset the counter after 10 calls
        if counter >= 2:
            counter = 0
        return f"Server started successfully with counter value {counter}"
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000) # Adjust port as needed
