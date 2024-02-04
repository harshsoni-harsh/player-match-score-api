const express = require('express')
const path = require('path')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')

const app = express()
app.use(express.json())

let db = null

try {
  async function run() {
    db = await open({
      filename: path.join(__dirname, 'cricketMatchDetails.db'),
      driver: sqlite3.Database,
    })
  }
  run()
} catch (e) {
  console.log(e)
  process.exit(1)
}

app.get('/players', async (req, res) => {
  let query = `
        SELECT
            player_id AS playerId,
            player_name AS playerName
        FROM
            player_details
    `
  let dbResponse = await db.all(query)
  res.send(dbResponse)
})

app.get('/players/:playerId', async (req, res) => {
  let {playerId} = req.params
  let query = `
        SELECT
            player_id AS playerId,
            player_name AS playerName
        FROM
            player_details
        WHERE
            player_id = ${playerId}
    `
  let dbResponse = await db.get(query)
  res.send(dbResponse)
})

app.put('/players/:playerId', async (req, res) => {
  let {playerId} = req.params
  let {playerName} = req.body
  let query = `
        UPDATE 
            player_details
        SET
            player_name = '${playerName}'
        WHERE
            player_id = ${playerId}
    `
  let dbResponse = await db.run(query)
  res.send('Player Details Updated')
})

app.get('/matches/:matchId', async (req, res) => {
  let {matchId} = req.params
  let query = `
        SELECT
            match_id AS matchId,
            match,
            year
        FROM
            match_details
        WHERE
            match_id = ${matchId}
    `
  let dbResponse = await db.get(query)
  res.send(dbResponse)
})

app.get('/players/:playerId/matches', async (req, res) => {
  let {playerId} = req.params
  let query = `
        SELECT
            match_details.match_id AS matchId,
            match,
            year
        FROM
            player_match_score INNER JOIN match_details ON player_match_score.match_id = match_details.match_id
        WHERE
            player_id = ${playerId}
    `
  let dbResponse = await db.all(query)
  res.send(dbResponse)
})

app.get('/matches/:matchId/players', async (req, res) => {
  let {matchId} = req.params
  let query = `
        SELECT
            player_details.player_id AS playerId,
            player_name AS playerName
        FROM
            player_match_score INNER JOIN player_details ON player_match_score.player_id = player_details.player_id
        WHERE
            match_id = ${matchId}
    `
  let dbResponse = await db.all(query)
  res.send(dbResponse)
})

app.get('/players/:playerId/playerScores', async (req, res) => {
  let {playerId} = req.params
  let query = `
        SELECT
            player_details.player_id AS playerId,
            player_name AS playerName,
            SUM (score) AS totalScore,
            SUM (fours) AS totalFours,
            SUM (sixes) AS totalSixes
        FROM
            player_match_score INNER JOIN player_details ON player_match_score.player_id = player_details.player_id
        WHERE
            player_details.player_id = ${playerId}
    `
  let dbResponse = await db.get(query)
  res.send(dbResponse)
})

app.listen(3000)

module.exports = app
