// imports
import express from 'express'
import { config } from 'dotenv'
import { initiateApp } from './src/initiate_app.js'
import { db_connection } from './DB/db_connection.js'

// config dotenv
config({ path: './config/dev.config.env' })

const app = express()

// function to initiate app
initiateApp(app, express)

db_connection()

// port 
const port = process.env.PORT || 3100
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
