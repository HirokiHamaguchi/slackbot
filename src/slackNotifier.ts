import axios from "axios";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config(
    {
        path: path.resolve('/home/fivelab/ドキュメント/HirokiHamaguchi/slackbot/.env')
    }
);

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL as string;

if (!SLACK_WEBHOOK_URL) {
    console.error("Error: SLACK_WEBHOOK_URL is not set in .env file");
    process.exit(1);
}

export async function sendSlackNotification(message: string) {
    try {
        const payload = {
            message: message,
        };

        const response = await axios.post(SLACK_WEBHOOK_URL, payload, {
            headers: { "Content-Type": "application/json" },
        });

        console.log("Slack notification sent:", response.status);
    } catch (error) {
        console.error("Error sending Slack notification:", error);
    }
}
