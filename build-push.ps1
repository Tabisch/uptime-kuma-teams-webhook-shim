docker login

$versionTag = Read-Host "VersionTag"

docker rmi (docker images tabisch/uptime-kuma-teams-webhook-shim -q)

docker builder prune -f

docker build -t tabisch/uptime-kuma-teams-webhook-shim:latest .

docker tag "tabisch/uptime-kuma-teams-webhook-shim:latest" "tabisch/uptime-kuma-teams-webhook-shim:$($versionTag)"

docker push "tabisch/uptime-kuma-teams-webhook-shim:$($versionTag)"