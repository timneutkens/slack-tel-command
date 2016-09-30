# Slack `/tel` command

Small slash command to get a user's phone number from the slack user directory

## Usage

`/tel [name]`

### Running the server

```bash
SLACK_API_TOKEN=<slack api token here> SLACK_TOKEN=<slashcommand token here> npm start
```

#### Deployment to [now.sh](https://zeit.co/now/)

```bash
now -e SLACK_API_TOKEN=<slack api token here> -e SLACK_TOKEN=<slashcommand token here>
```
