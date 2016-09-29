const pify = require('pify')
const { json, send, createError } = require('micro')
const { parse } = require('querystring')
const getRawBody = require('raw-body')
const typer = require('media-typer')
const parseFormData = require('urlencoded-body-parser')
const list = pify(require('slack/methods/users.list'))
const Fuse = require('fuse.js')

async function fetchUsers() {
    const { members } = await list({token: process.env.SLACK_API_TOKEN})
    return members.reduce((users, { name, deleted, is_bot: isBot, profile: {phone} }) => {
      if(deleted || isBot || !phone) {
        return users;
      }

      return [...users, { name, phone }]
    }, [])
}

module.exports = async function(req, res) {
  if(req.method !== 'POST') {
    return '';
  }

  const slackData = await parseFormData(req)
  const data = await fetchUsers()
  const fuse = new Fuse(data, {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    keys: [
      "name",
      "phone"
    ]
  });

  return fuse.search(slackData.test);
}
