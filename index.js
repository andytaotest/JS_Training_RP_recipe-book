const express = require('express');
const ejs = require('ejs');
const mysql = require('mysql2/promise')
require('dotenv').config(); //read .env to OS environment

const app = express();
app.use(express.urlencoded({
    extended: false
  })); // enable forms

// initialise the database
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true, //wait if all are in use
    connectionLimit: 10,
    queueLimit: 0 //0 means infinite queue, FIFO
});

app.set("view engine", "ejs");

app.get("/", function(req,res){
	res.render("home.ejs");
});

//get all recipes
app.get('/recipes', async function(req,res){
    const [results] = await pool.query('SELECT * FROM recipes');
    // res.json(results);//format the argument as javascript object string
    res.render("recipes.ejs", {
        recipes: results
    });
});

//add
app.get('/recipes/add', function(req, res){
    res.render("newRecipe");
});

app.post('/recipes', async function(req, res){
    const { name, ingredients, instructions } = req.body;
    await pool.query('INSERT INTO recipes (name, ingredients, instructions) VALUES (?, ?, ?)', [name, ingredients, instructions]);
    res.redirect('/recipes');
});

//update
app.get('/recipes/:id/edit', async function(req, res){
    const { id } = req.params;
    const [results] = await pool.query('SELECT * FROM recipes WHERE id = ?', [id]);
    res.render("editRecipe", { recipe: results[0] });
});

app.post('/recipes/:id', async function(req, res){
    const { id } = req.params;
    const { name, ingredients, instructions } = req.body;
    await pool.query('UPDATE recipes SET name = ?, ingredients = ?, instructions = ? WHERE id = ?', [name, ingredients, instructions, id]);
    res.redirect('/recipes');
});

//delete
app.get('/recipes/:id/delete', async function(req, res){
    const { id } = req.params;
    await pool.query('DELETE FROM recipes WHERE id = ?', [id]);
    res.redirect('/recipes');
});

// start server
app.listen(8080, function(){
    console.log("Express server has started");
});