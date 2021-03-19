#!/usr/bin/env python

import argparse
#import re
import time
import win32com.client
import requests 

# Constants
DefaultTallyLayer = 3
Live = 2
Preview = 1
Clear = 0

# Variables/Config
tallyLayer = 3
TallySendInterval = 5               # Interval in seconds
regex = "\[(.*?)\]"                     # Regular Expression to find Tally info in shot name between []

# Network Interface Settings
MCAST_GRP = "224.0.0.20"                # Multicast Group IP
MCAST_PORT = 3000                       # Multicast port number
TTL = 2                                 # Time-to-live
Bind = False                            # Bind to specific network adapter
localIP = 0
wirecastIsOpen = True
autoLive = False
TallyState = [0 for i in range(256)]    # Tally State buffer 0-255
srcList = []  
layerInfos = {'Live': [], 'Preview': []}
CONTROLLER = "http://localhost:8080/api"
# =======================================================
# Helper Functions
# =======================================================
# def parseTallyInfo(shotName, state):                                    # Get Tally info from Shot Name - [T:1,2,3]
#     tally_data = re.findall(regex, str(shotName))                       # Save what's between the brackets []
# 
#     if tally_data:
#         key_value = tally_data[0].split(":")                            # Split Key/Value pair
# 
#         if key_value[0] == "T" or key_value[0] == "t":                  # If key exists...
#             tally_ids = key_value[1].split(",")                         # ...get comma separated values.
# 
#             for idx in range(0, len(tally_ids)):                        # Process each value as a tally ID
#                 try:
#                     tallyNum = int(tally_ids[idx])-1                    # Convert ASCII tally ID to integer
#                     TallyState[tallyNum] = state                        # Write tally state to buffer (live or preview)
#                 except ValueError:
#                     pass

def getWirecastData():
    try:
        wc = win32com.client.GetActiveObject("Wirecast.Application").DocumentByIndex(1)
        # Get Autolive State
        AutoLiveActiveState = wc.AutoLive

        #autoLive = AutoLiveActiveState
        #if AutoLiveActiveState == 1:
            #print("Autolive: ON")
        #else:  # Preview
            #print("Autolive: OFF")

        print("Wirecast: OPEN")
        for i in range(5):
            for j in range(1024):
                if wc.ShotByShotID(j) is not None and wc.ShotByShotID(j).Name[0:3] == "@TL" and wc.ShotByShotID(j).Name not in srcList:
                    srcList.append(wc.ShotByShotID(j).Name)

            PreviewShotID = wc.LayerByIndex(i+1).PreviewShotID()

            if wc.ShotByShotID(PreviewShotID) is not None and wc.ShotByShotID(PreviewShotID).Name[0:3] == "@TL" and wc.ShotByShotID(PreviewShotID).Name not in layerInfos['Preview']:
                layerInfos['Preview'].append(wc.ShotByShotID(PreviewShotID).Name)
            
            print('PREVIEW %s - %s - %s '%(i, wc.ShotByShotID(PreviewShotID).Name, layerInfos['Preview']))

            LiveShotID = wc.LayerByIndex(i+1).LiveShotID()

            if wc.ShotByShotID(LiveShotID) is not None and wc.ShotByShotID(LiveShotID).Name[0:3] == "@TL" and wc.ShotByShotID(LiveShotID).Name not in layerInfos['Live']:
                layerInfos['Live'].append(wc.ShotByShotID(LiveShotID).Name)
            print('LIVE  %s - %s - %s'%(i, wc.ShotByShotID(PreviewShotID).Name, layerInfos['Live']))


        return True

    except ValueError:
        print(ValueError)
        wirecastIsOpen = False
        print("Wirecast: CLOSED")

        return False

def handleArguments():
    #global tallyLayer
    #global localIP
    #global Bind

    parser = argparse.ArgumentParser()
    #parser.add_argument("-l", "--layer", help="sets layer tally monitors (1-5)", type=int, default=3)
    #parser.add_argument("-b", "--bind", help="binds to internet connected network adapter", action="store_true")
    args = parser.parse_args()

# =======================================================
# Main
# =======================================================
if __name__ == "__main__":
    handleArguments()

    while True:
        srcList = []  
        layerInfos = {'Live': [], 'Preview': []}
        getWirecastData()                                                   # Get latest Wirecast information

        try:
            requests.post(url = '%s/pushSources'%CONTROLLER, json = srcList) 
            requests.post(url = '%s/pushLayers'%CONTROLLER, json = layerInfos) 
            #print(layerInfos)

        except ValueError:
            print(ValueError)

        #print(srcList[0])
        # if wirecastIsOpen:
        #     if autoLive == 0:                                       # If Autolive is Off check preview
        #         parseTallyInfo(dict['Preview'], Preview)

        #    parseTallyInfo(dict['Live'], Live)


        time.sleep(TallySendInterval)
