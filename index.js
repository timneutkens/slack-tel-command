const pify = require('pify')
const parseFormData = require('urlencoded-body-parser')
const list = pify(require('slack/methods/users.list'))
const Fuse = require('fuse.js')

async function fetchUsers () {
  const { members } = await list({token: process.env.SLACK_API_TOKEN})
  return members.reduce((users, { name, real_name: realName, deleted, is_bot: isBot, profile: {phone} }) => {
    if (deleted || isBot || !phone) {
      return users
    }

    return [...users, { name: realName || name, phone }]
  }, [])
}

const renderList = data => data.map(({name, phone}) => `*${name}*: ${phone}`).join('\n')

module.exports = async function (req, res) {
  if (req.method !== 'POST') return ''

  const {text: searchText, token} = await parseFormData(req)

  if (token !== process.env.SLACK_TOKEN) return 'Unathorized'

  if (!searchText || searchText === '') return 'Please supply a query'

  const data = await fetchUsers()
  if (searchText === 'all') return renderList(data)

  const fuse = new Fuse(data, {
    shouldSort: true,
    threshold: 0.3,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    keys: [
      'name',
      'phone'
    ]
  })

  const results = fuse.search(searchText)

  if (results.length > 0) return renderList(results)

  return 'Could not find user'
}
