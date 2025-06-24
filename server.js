
import express from 'express'

import DbConnection from './config/mongoose.js';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './router/router.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const port = process.env.PORT;
const app = express();
//L
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;

// app.use(bodyParser.json({ extended: true }));
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/', router);


DbConnection(username, password).then(() => {
    app.listen(port, () => {
        console.log(`✅ Server is running on port: ${port}`);
    });
}).catch((error) => {
    console.error('❌ Failed to connect to DB or start server:', error);
    process.exit(1); // Use 1 for general errors, not 0 (which means successful exit)
});
