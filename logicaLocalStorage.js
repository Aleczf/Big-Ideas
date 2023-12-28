
class NoteManager {

    constructor() {
        this.notes = []
    }


    createNote() {
        
    }


    loadNote(){
        const noteToLoad = JSON.parse(localStorage.getItem('notes__Deck') || "[]")
        console.log(noteToLoad)
        return noteToLoad
    }


    
    saveNote(noteToSave) {
        this.notes.push(noteToSave)
        localStorage.setItem('notes__Deck', JSON.stringify(this.notes))
        console.log(noteToSave)
        
    }


    getAllNotes() {

        const allNotes = this.loadNote()
        contentCard.innerText = allNotes


        console.log(contentCard)
    
    }



}