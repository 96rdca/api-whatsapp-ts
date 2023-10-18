import "dotenv/config"
import express from "express"
import cors from "cors"
import routes from "./infrastructure/router"
const port = process.env.PORT || 3001
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('tmp'))
app.use(`/`, routes)
// app.use((req, res, next) => {
//     const currentTime = new Date();
//     const startHour = 8;
//     const endHour = 17;

//     if(currentTime.getHours() >= startHour && currentTime.getHours() < endHour ){
//         next();
//     }else{
//         res.status(403).send('API is only available from 8 am to 5 pm');
//     }
// })

app.listen(port, () => console.log(`Ready... @port:${port}`))