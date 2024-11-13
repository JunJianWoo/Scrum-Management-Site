const { getLargestID, insertBoardItem, getBoardItem } = require('../controllers/board_items_database')
const boardSections = ["productBacklog", "sprintBacklog", "sprintToDo", "completed"]

/** Board Item class to structure the creation of board Items */
class boardItem{

    constructor(inputObject){
        let {id, title,priority,location,assignee,estimate,isSubTask, subtasks,dayOfCompletion} = inputObject
        this.id = (id)?id:(getLargestID())?getLargestID()+ 1: 1
        this.title = title
        this.priority = priority
        this.location = location

        this.assignee = assignee?assignee:""
        this.estimate = Number(estimate)
        this.isSubTask = (isSubTask != undefined && isSubTask != 'false')?true:false
        if (subtasks == undefined || subtasks == '[]'){
            this.subtasks = []
        } else {
            this.subtasks = []
            let idList = subtasks.slice(1,-1).split(",")
            idList = idList.map(ele=>Number(ele))
            for (const subtaskID of idList){
                let data = getBoardItem({"id": subtaskID})
                if (data != undefined){
                    let obj = new boardItem(data)
                    this.subtasks.push(obj)
                }
            }
        }
        this.dayOfCompletion = (dayOfCompletion)?Number(dayOfCompletion):-10
    }

    // Changes the location number by moving left
    moveLeft(){
        let sectionNo = boardSections.indexOf(this.location)
        if (sectionNo >= 1 && sectionNo <= 3){
            this.location = boardSections[sectionNo - 1]
            return true             
        } else {
            return false
        }
    }

    // Changes the location number by moving right
    moveRight(){
        let sectionNo = boardSections.indexOf(this.location)
        if (sectionNo >= 0 && sectionNo <= 2){
            this.location = boardSections[sectionNo + 1]
            return true   
        } else {
            return false
        }
    }

    formatForDB(){
        return {
            "id": this.id,
            "title": this.title,
            "priority": this.priority,
            "location": this.location,
            "assignee": this.assignee,
            "estimate": this.estimate,
            "isSubTask": (this.isSubTask)?"true":"false",
            "subtasks": (this.subtasks == undefined || this.subtasks.length == 0)?"[]":`[${this.subtasks.map(ele=>ele.id).join(',')}]`,
            "dayOfCompletion": this.dayOfCompletion
        }
    }

}
module.exports = { boardItem }
