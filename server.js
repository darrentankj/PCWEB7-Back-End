import express from "express";
import mysql from "mysql2";
import fs from 'fs';
import cors from "cors";

const pool = mysql.createPool({
  host:"gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
  user:"3XxyuCCmaVFyceZ.root",
  password:"BvkTy1vQ1q5P82NR",
  database: "test",
  ssl: {
    ca: fs.readFileSync("isrgrootx1.pem")
  }
}).promise();

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function getPost(id) {
    const [rows] = await pool.query(
        `select *
        from weather
        where id = ?
        `,
        [id]
    );
    return rows[0];
}
      
async function addPost(temp, prec, uvi, time,location) {
    const [result] = await pool.query(
        `INSERT INTO weather (temp, prec, uvi,time,location)
        VALUES (?, ?, ?,?,?)
        `,
        [temp ,prec, uvi,time,location]
    );
    const id = result.insertId;
    return getPost(id);
}

async function getPosts() {
    const [rows] = await pool.query("SELECT * FROM weather;");
    return rows;
}

async function deletePost(id) {
    await pool. query('DELETE FROM weather where id = ?', [id]);
}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });

app.get("/post/:id", async (req, res) => {
    const id = req.params.id;
    const post = await getPost(id);
    res.send(post).status(202);
});

app.post("/add", async (req, res) => {
    const { temp, prec, uvi,time,location } = req.body;
    const record = await addPost(temp, prec, uvi,time,location);
    console.log("Post added: ", record);
    res.send({ status: "success" }).status(202);
});

app.get("/posts", async (req, res) => {
    const posts = await getPosts();
    res.send(posts).status(202);
});

app.delete("/delete/:id", async (req, res) => {
    const id = req.params.id;
    await deletePost(id);
    res.send({ status: "success" }) . status (202);
});