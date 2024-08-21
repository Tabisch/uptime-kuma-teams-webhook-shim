const express = require("express");
const path = require('path');
const app = express();
const port = 7000;

app.use(express.json())

function themeColorToStyle(themeColor) {
    if (themeColor === "ff0000") {
        return "attention"
    }

    if (themeColor === "00e804") {
        return "good"
    }

    return "emphasis"
}

function statusMessageFactory(themeColor, monitorName) {
    if (themeColor === "ff0000") {
        return `🔴 Application [${monitorName}] went down`;
    }
    if (themeColor === "00e804") {
        return `✅ Application [${monitorName}] is back online`;
    }
    return "Notification";
};

function buildMessage(status, monitorMessage, monitorName, monitorUrl) {
    const facts = [];
    const actions = [];

    if (monitorMessage) {
        facts.push({
            title: "Description",
            value: monitorMessage,
        });
    }

    if (monitorName) {
        facts.push({
            title: "Monitor",
            value: monitorName,
        });
    }

    if (monitorUrl && monitorUrl !== "https://") {
        facts.push({
            title: "URL",
            // format URL as markdown syntax, to be clickable
            value: `[${monitorUrl}](${monitorUrl})`,
        });
        actions.push({
            "type": "Action.OpenUrl",
            "title": "Visit Monitor URL",
            "url": monitorUrl
        });
    }

    // if (heartbeatJSON?.localDateTime) {
    //     facts.push({
    //         title: "Time",
    //         value: heartbeatJSON.localDateTime + (heartbeatJSON.timezone ? ` (${heartbeatJSON.timezone})` : ""),
    //     });
    // }

    const payload = {
        "type": "message",
        // message with status prefix as notification text
        "summary": statusMessageFactory(status, monitorName, true),
        "attachments": [
            {
                "contentType": "application/vnd.microsoft.card.adaptive",
                "contentUrl": "",
                "content": {
                    "type": "AdaptiveCard",
                    "body": [
                        {
                            "type": "Container",
                            "verticalContentAlignment": "Center",
                            "items": [
                                {
                                    "type": "ColumnSet",
                                    "style": themeColorToStyle(status),
                                    "columns": [
                                        {
                                            "type": "Column",
                                            "width": "auto",
                                            "verticalContentAlignment": "Center",
                                            "items": [
                                                {
                                                    "type": "Image",
                                                    "width": "32px",
                                                    "style": "Person",
                                                    "url": "https://raw.githubusercontent.com/louislam/uptime-kuma/master/public/icon.png",
                                                    "altText": "Uptime Kuma Logo"
                                                }
                                            ]
                                        },
                                        {
                                            "type": "Column",
                                            "width": "stretch",
                                            "items": [
                                                {
                                                    "type": "TextBlock",
                                                    "size": "Medium",
                                                    "weight": "Bolder",
                                                    "text": statusMessageFactory(status, monitorName),
                                                },
                                                {
                                                    "type": "TextBlock",
                                                    "size": "Small",
                                                    "weight": "Default",
                                                    "text": "Uptime Kuma Alert",
                                                    "isSubtle": true,
                                                    "spacing": "None"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "type": "FactSet",
                            "separator": false,
                            "facts": facts
                        }
                    ],
                    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                    "version": "1.4"
                }
            }
        ]
    };

    if (actions) {
        payload.attachments[0].content.body.push({
            "type": "ActionSet",
            "actions": actions,
        });
    }
    return payload;
}

app.post("*", async (req, res) => {
    const destWebhook = await Buffer.from(req.url.substring(1), 'base64').toString('utf-8')

    const status = req.body.themeColor
    const monitorMessage = req.body.sections[2].text

    console.log(`${(new Date).toISOString()} - Processing message - ${monitorMessage}`)

    let monitorName = null

    if (req.body.sections[2].facts[0] && req.body.sections[2].facts[0].name === "Monitor") {
        monitorName = req.body.sections[2].facts[0].value
    }

    let monitorUrl = null

    if (req.body.sections[2].facts[0] && req.body.sections[2].facts[0].name === "URL") {
        monitorUrl = req.body.sections[2].facts[0].value
    }

    if (req.body.sections[2].facts[1] && req.body.sections[2].facts[1].name === "URL") {
        monitorUrl = req.body.sections[2].facts[1].value
    }

    const message = await JSON.stringify(buildMessage(status, monitorMessage, monitorName, monitorUrl))

    try {
        await fetch(destWebhook, {
            method: 'POST',
            body: message,
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })

        res.sendStatus(200)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.listen(port, () => {
    console.log(`Kuma Teams Webhook shim listening on port ${port}!`);
});