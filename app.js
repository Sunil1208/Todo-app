const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const Joi = require('joi');

const database = require("./database");
const collection = "todo";
const app = express();
const port = process.env.PORT ||5050

const schema = Joi.object().keys({
    todo: Joi.string().required(),
    //completed: false
    completed: Joi.boolean().default(false)
});

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// read
app.get('/getTodos', (req, res) => {

    database.getDB().collection(collection).find({}).toArray((err, documents) => {
        if (err)
            console.log(err);
        else {
            res.json(documents);
        }
    });
});


app.put('/:id', (req, res) => {

    const todoID = req.params.id;

    const userInput = req.body;

    database.getDB().collection(collection).findOneAndUpdate({
        _id: database.getPrimaryKey(todoID)
    }, {
        $set: {
            todo: userInput.todo,
        }
    }, {
        returnOriginal: false
    }, (err, result) => {
        if (err)
            console.log(err);
        else {
            res.json(result);
        }
    });
});

app.put('/:id/completed', (req, res) => {

    const todoID = req.params.id;

    database.getDB().collection(collection).findOneAndUpdate({
        _id: database.getPrimaryKey(todoID)
    }, {
        $set: {
            //todo: todo,
            completed:true
        }
    }, {
        returnOriginal: false
    }, (err, result) => {
        if (err)
            console.log(err);
        else {
            res.json(result);
            console.log("completed");
        }
    });
});

app.put('/:id/notcompleted', (req, res) => {

    const todoID = req.params.id;

    database.getDB().collection(collection).findOneAndUpdate({
        _id: database.getPrimaryKey(todoID)
    }, {
        $set: {
            //todo: todo,
            completed:false
        }
    }, {
        returnOriginal: false
    }, (err, result) => {
        if (err)
            console.log(err);
        else {
            res.json(result);
            console.log("Not completed");
        }
    });
});

//Creating the database
app.post('/', (req, res, next) => {
    const userInput = req.body;
    Joi.validate(userInput, schema, (err, result) => {
        if (err) {
            const error = new Error("Invalid Input");
            error.status = 400;
            next(error);
        } else {
            database.getDB().collection(collection).insertOne(userInput, (err, result) => {
                if (err) {
                    const error = new Error("ToDo Document insertion failed!!");
                    error.status = 400;
                    next(error);
                } else
                    res.json({
                        result: result,
                        document: result.ops[0],
                        //completed:false,
                        msg: "Task Successfully added!!",
                        msg1: "Task deleted successfully",
                        error: null
                    });
            });
        }
    })
});


//deleting from the database
app.delete('/:id', (req, res) => {
    const todoID = req.params.id;
    database.getDB().collection(collection).findOneAndDelete({
        _id: database.getPrimaryKey(todoID)
    }, (err, result) => {
        if (err)
            console.log(err);
        else
            res.json(result);
    });
});

app.use((err, req, res, next) => {
    res.status(err.status).json({
        error: {
            message: err.message
        }
    });
})

database.connect((err) => {

    if (err) {
        console.log('Unable to establish connection with the database');
        process.exit(1);
    } else {
        app.listen(port, () => {
            console.log('Connection established with the database, server running at port ' + port);
        });
    }
});