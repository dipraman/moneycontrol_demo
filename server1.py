import socket
import json
import time
import sys

def connectETController(ip, port=8055):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sock.connect((ip, port))
        return (True, sock)
    except Exception as e:
        sock.close()
        return (False, sock)  # Return the socket even in case of failure

def disconnectETController(sock):
    if sock:
        sock.close()
        sock = None
    else:
        sock = None

def sendCMD(sock, cmd, params=None, id=1):
    if not params:
        params = []
    else:
        params = json.dumps(params)
    sendStr = "{{\"method\":\"{0}\",\"params\":{1},\"jsonrpc\":\"2.0\",\"id\":{2}}}".format(cmd, params, id) + "\n"
    try:
        sock.sendall(bytes(sendStr, "utf-8"))
        ret = sock.recv(1024)
        jdata = json.loads(str(ret, "utf-8"))
        if "result" in jdata.keys():
            return (True, json.loads(jdata["result"]), jdata["id"])
        elif "error" in jdata.keys():
            return (False, jdata["error"], jdata["id"])
        else:
            return (False, None, None)
    except Exception as e:
        return (False, None, None)

if __name__ == "__main__":

    if len(sys.argv) > 1:
        try:
            counter = int(sys.argv[1])
            print(f"Counter value received: {counter}")
        except ValueError:
            print("Invalid counter value provided")
            sys.exit(1)
    else:
        print("No counter value provided")
        sys.exit(1)


    

    robot_ip = "192.168.1.200"
    conSuc, sock = connectETController(robot_ip)
    jbi_filename = "rt"

    # If servo is off, turn servo on
    suc, result, id = sendCMD(sock, "getServoStatus")
    if result == 0:
        suc, result, id = sendCMD(sock, "set_servo_status", {"status": 1})

    # Set robot speed
    P000 = [0, -90, 90, -90, 90, 0]
    suc, result, id = sendCMD(sock, "setSpeed", {"value": 40})
 
    print(counter)
    z=94 #z axis value for whole area for the whole 3D Area
    if(counter==0):
        print("case 1")
        #result11=[226.20597909690838, -354.43577410292, z, -1.7269827594112361, -0.6559210500675622, 0.32329058507549313]
        result11=[149.0484180807635, -492.4990153509084, 93.69822261104464, 0.0019172977194325323, -0.22762071232394943, 2.557111366629074]
        suc, pose1, id = sendCMD(sock, "inverseKinematic", {"targetPose": result11, "referencePos": P000})
        suc, result, id = sendCMD(sock, "moveByLine", {"targetPos": pose1, "speed_type":0, "speed": 200, "cond_type": 0, "cond_num": 7, "cond_value": 1})
    else:
        print("case 2")
        result11=[-20.0484180807635, -492.4990153509084, 93.69822261104464, 0.0019172977194325323, -0.22762071232394943, 2.557111366629074]
        suc, pose1, id = sendCMD(sock, "inverseKinematic", {"targetPose": result11, "referencePos": P000})
        suc, result, id = sendCMD(sock, "moveByLine", {"targetPos": pose1, "speed_type":0, "speed": 200, "cond_type": 0, "cond_num": 7, "cond_value": 1})


    print("motion result", result)
    
    time.sleep(10)

    if conSuc:
        suc, result, id = sendCMD(sock, "checkJbiExist", {"filename": jbi_filename})
        if suc and result == 1:
            print("jbi file found")

            # Run jbi file
            suc, result, id = sendCMD(sock, "runJbi", {"filename": jbi_filename})
            print("command sent")
            print(result)

            if suc and result:
                checkRunning = 3
                while checkRunning == 3:
                    # Get jbi file running status
                    suc, result, id = sendCMD(sock, "getJbiState")
                    checkRunning = result["runState"]
                    time.sleep(0.1)
                    print(result)

    suc, result, id = sendCMD(sock, "get_tcp_pose")
    print(result)

    # If servo is on, turn it off
    suc, result, id = sendCMD(sock, "getServoStatus")
    if result == 1:
        suc, result, id = sendCMD(sock, "set_servo_status", {"status": 0})
