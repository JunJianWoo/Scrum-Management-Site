const Database = require('better-sqlite3');
let sql;
const express = require('express')
const path = require('path')

// Creates Database and reads existing ones and prints all executed commands on database to the terminal
const db = new Database(path.join(__dirname,'boarditem.db'),{verbose: console.log});
db.exec("CREATE TABLE IF NOT EXISTS boarditem('id','title','priority','location','assignee','estimate','isSubTask','subtasks','dayOfCompletion')")

const itemIdentifier = `WHERE id = @id`

// Insert into boarditem DB 
// boardItem is an object with all the boarditem key-value pairs (more details shown in board_items.js formatForDB() method )
const insert = db.prepare('INSERT INTO boarditem (id,title,priority,location,assignee,estimate,isSubTask,subtasks,dayOfCompletion) VALUES (@id, @title, @priority, @location, @assignee, @estimate, @isSubTask, @subtasks, @dayOfCompletion)')
function insertBoardItem(boardItem){
    try {
        return insert.run(boardItem)
    } catch (err){
        console.log(err.message)
        return undefined;
    }
}

// Select boarditem based on their ID   (boardItemID is in the form of { 'id': .... } )
const select = db.prepare(`SELECT * FROM boarditem ${itemIdentifier}`)
function getBoardItem(boardItemID){
    try {
        return select.get(boardItemID)
    } catch (err){
        console.log(err.message)
        return undefined;
    }
}

/**  sqlOperation should be something like 'SELECT * FROM boarditem WHERE ...........'
/ Used for flexible querying of items of the board.
/ Lookup sqlite3 `SELECT` operations to get a clue what's possible.
/ E.g. queryBoardItem(`SELECT * FROM boarditem WHERE assignee='Jesus Christ'`)
*/ 
function queryBoardItem(sqlOperation){
    try {
        return db.prepare(sqlOperation).all()
    } catch (err){
        console.log(err.message)
        return undefined;
    }
}

// itemsToUpdate is an object of key-value pairs (key being itemToUpdate, value being valueToUpdateTo)
// Updates the properties in itemsToUpdate on the boarditem with the inputted ID
// boardItemID is in the form of { 'id': .... } 
function updateBoardItem(itemsToUpdate, boardItemID){
    let request = `UPDATE boarditem SET `
    let changeStr = []
    for ( const keys of Object.keys(itemsToUpdate) ){
        if (typeof itemsToUpdate[keys] == 'string'){
            changeStr.push(`${keys} = '${itemsToUpdate[keys]}'`)
        } else if (typeof itemsToUpdate[keys] == 'number'){
            changeStr.push(`${keys} = ${itemsToUpdate[keys]}`)
        }
    }
    request += changeStr.join(", ")
    request += ` ${itemIdentifier}`

    try {
        return db.prepare(request).run(boardItemID)
    } catch (err){
        console.log(err.message);
        return undefined;
    }
}

const deleteItem = db.prepare(`DELETE FROM boarditem ${itemIdentifier}`)

// Deletes boarditem from DB using ID
// boardItemID is in the form of { 'id': .... } 
function deleteBoardItem(boardItemID){
    return deleteItem.run(boardItemID)
}

// Returns all boarditems in non-object format
function getAllBoardItem(){
    return db.prepare(`SELECT * FROM boarditem`).all()
}

// Helper method to create unique ID for all boarditems
function getLargestID(){
    let data = db.prepare(`SELECT MAX(id) FROM boarditem`).all()
    return data[0]['MAX(id)']
}

// console.log(getBoardItem({'id': "4"}))
console.log(queryBoardItem("SELECT * FROM boarditem WHERE assignee='Jesus Christ'"))

module.exports = {insertBoardItem, getBoardItem, updateBoardItem, deleteBoardItem, getAllBoardItem, getLargestID, queryBoardItem}
