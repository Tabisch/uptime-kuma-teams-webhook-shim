# uptime-kuma-teams-webhook-shim
This is a very simple tool to convert the old Teams connector webhook calls to the new workflow webhook calls \
It' on Docker Hub, if you dont want to build it yourself. \
https://hub.docker.com/repository/docker/tabisch/uptime-kuma-teams-webhook-shim/general

## How to use
Copy the container definition from compose.yaml and Deploy. 

Open Container Website
![image](https://github.com/user-attachments/assets/6a73881d-eb6b-43d1-b3ad-042588f7ad31)

Paste Webhook URL to top box. \
If you run the shim in the same docker network as the kuma instance you can check the "Docker?" to stay internal. \
Click the "convert" button.\
Copy the converted URL and paste it in to the Webhook-Text box in Uptime Kuma.
