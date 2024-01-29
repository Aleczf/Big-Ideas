
//  FIREBASE STUFF
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js"
import { getDatabase, onValue, push, ref, update, set, remove } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js"

const appSettings = {
    databaseURL: "https://big-ideas-3d5f2-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const notesInDB = ref(database, "notes")


onValue(notesInDB, (snapshot) => {

    container.innerHTML = ''   //RIPULISCO IL CONTANIER PRIMA DI AGGIUNGERE LE NOTE
    let notes = Object.values(snapshot.val()) //FETCH DEI VALUES DELLE NOTE DA FIREBASE E CONVERSIONE DELL'OGGETTO IN ARRAY
    
})




function updateUI() {
    onValue(notesInDB, (snapshot) => {
        container.innerHTML = ''   //RIPULISCO IL CONTANIER PRIMA DI AGGIUNGERE LE NOTE
        let notes = Object.values(snapshot.val()) //FETCH DEI VALUES DELLE NOTE DA FIREBASE E CONVERSIONE DELL'OGGETTO IN ARRAY
        
        alreadySavedCardArr = notes
        
        notes.forEach((nota) => {
            createCard(nota.title, nota.content, nota.uuid)
        })
    })    
}

document.addEventListener('DOMContentLoaded', updateUI) //faccio riferimento ad updateUI al caricamento del dom ma senza invocarla
updateUI()




const container = document.getElementById('container')
const overlay = document.getElementById("overlay")
const card = document.getElementById("card")
let cardArr = []
let alreadySavedCardArr = []


function createCard(_title = 'Titolo', _content = '', uuid) {

    //CREO NUOVA CARD    
    const newCard = document.createElement('div')
    newCard.id = 'card'
    newCard.className = 'card'

    // CREO NUOVO UUID E LO ASSEGNO AD OGNI CARD CREATA
    if(!uuid) {
        uuid = Math.floor(Math.random() * 10000000)
        newCard.setAttribute ('data-uuid', uuid) 
    }

    //CREO TITOLO DA INSERIRE NELLA CARD
    const title = document.createElement('h2')
    title.id = 'title-card'
    title.className = 'title-card'
    title.contentEditable = true
    title.textContent = _title
    
    //CREO TEXTAREA DA INSERIRE NELLA CARD
    const content = document.createElement('div')
    content.id = 'content-card'
    content.className = 'content-card'
    content.contentEditable = true
    content.textContent = _content

    //CREO PULSANTE ELIMINA DA INSERIRE NELLA CARD
    const deleteBtn = document.createElement('div')
    deleteBtn.id = 'delete-btn'
    deleteBtn.className = 'delete-btn'
    deleteBtn.textContent = "X"
    deleteBtn.setAttribute('data-uuid', uuid)

    newCard.appendChild(title)
    newCard.appendChild(content)
    newCard.appendChild(deleteBtn)
    container.insertAdjacentElement('afterbegin', newCard)


    saveOnFocusOut(newCard, uuid)
    deleteNote()
    
}

   



//  GESTIONE AGGIUNTA CARD AL DOM 
document.getElementById('add-btn').addEventListener('click', () => {
    createCard()
})


//  GESTIONE svuota tutto 
document.getElementById('svuota-tutto').addEventListener('click', () => {
    
    onValue(notesInDB, (snapshot) => {
        container.innerHTML = ''   //RIPULISCO IL CONTANIER PRIMA DI AGGIUNGERE LE NOTE
        remove(notesInDB)
        location.reload()
    })
})




// FUNZIONE PER ESPANSIONE DELLA CARD

function expandCard(card) {   
    card.classList.add("expanded")
    overlay.style.display = "block" 
}

container.addEventListener('click', (event) => {
    const expandedCard = document.querySelector('.card.expanded')

    if(expandedCard && !event.target.closest('.card')) {
        expandedCard.classList.remove("expanded")
        overlay.style.display = "none"
    }
})


//HANDLER CLICK EXPANDED CARD
document.addEventListener('click', function(event) {
    const selectedCard = event.target.closest('.card')
    const expandedCard = document.querySelector('.card.expanded')

    if(selectedCard){       // ESPANDE LA CARD
        expandCard(selectedCard)

    } else if(expandedCard && !event.target.closest('.card')) { //CONTRAE LA CARD
        expandedCard.classList.remove("expanded")
        overlay.style.display = "none"
    }
})



function editFirebaseNote(editedNote){
    const noteRef = ref(database, `notes/${editedNote.uuid}`)

    set(noteRef, editedNote)

    console.log('Nota aggiornata su Firebase')
}



// SALVO NUOVA NOTA O MODIFICO SE PREESISTENTE
function saveNote(selectedCard) {

    let _uuid = selectedCard.getAttribute('data-uuid')
    let _title = selectedCard.querySelector('.title-card').innerText
    let _content = selectedCard.querySelector('.content-card').innerText

    const existingCardIndex = cardArr.findIndex(card => card.uuid === _uuid)

    if(existingCardIndex !== -1){         // MODIFICA NOTA GIA ESISTENTE
        cardArr[existingCardIndex].title = _title
        cardArr[existingCardIndex].content = _content

        console.log(cardArr)


        editFirebaseNote( cardArr[existingCardIndex])

        // onValue(notesInDB, (snapshot) => {
        //     container.innerHTML = ''   //RIPULISCO IL CONTAINER PRIMA DI AGGIUNGERE LE NOTE
    
        //     let notes = Object.values(snapshot.val()) //FETCH DEI VALUES DELLE NOTE DA FIREBASE E CONVERSIONE DELL'OGGETTO IN ARRAY
            
        //     for (const nota of notes) {
        //         createCard(nota.title, nota.content, nota.uuid)  //devo ricreare la card senza crearne una nuova ma ripopolandola con i valori del fetch
        //     }
        // })

        console.log('modifica nota')


    } else {     // CREA NUOVA NOTA
        const newNote = {
            title : _title,
            content : _content,
            uuid : _uuid
        }
        cardArr.push(newNote)
        console.log('nuova nota')

        push(notesInDB, newNote)      

    }    
    return
}



function saveOnFocusOut(myCard, _uuid) {


    myCard.addEventListener('focusout', (event) => {
        console.log('focusout innescato')

        const isDeleteButton = event.relatedTarget && event.relatedTarget.id === 'delete-btn';
        const isOverlay = event.relatedTarget && event.relatedTarget.id === 'overlay';

        if (!isDeleteButton && !isOverlay) {
        
            // Se il focusout non è stato causato dal click sul pulsante di eliminazione o sull'overlay, salva la nota
        
            // _uuid = myCard.getAttribute('data-uuid')
        
            saveNote(myCard, _uuid);
            updateUI();
        }

        const expandedCard = document.querySelector('.card.expanded');
        if (!expandedCard) {
            overlay.style.display = "none";
        }
    });
}

function getNotesFromDB() {
    onValue(notesInDB, (snapshot) => {
    
        const notesArrFromDB = snapshot.val()

        console.log(notesArrFromDB)
    })
    
    
}


function deleteNote(){

    const deleteBtns = document.querySelectorAll('.delete-btn')

    deleteBtns.forEach(deleteBtn => {
        deleteBtn.addEventListener('click', (event) => {
            event.stopImmediatePropagation() 
    
            const uuid = deleteBtn.getAttribute('data-uuid')
            const selectedCard = event.target.closest('.card')     
            console.log('rimosso')

            
    
                onValue(notesInDB, (snapshot) => {
                    
                    if (notesInDB) {
                        const notesArrFromDB = snapshot.val() //OTTENGO ELENCO DI NOTE DA FIREBASE SOTTOFORMA DI OGGETTO
                        console.log(notesArrFromDB)

                        let noteKeys = Object.keys(notesArrFromDB) // OTTENGO CHIAVI DELLE NOTE SALVATE SU FB E TRASFORMO OGGETTO DI NOTE IN ARRAY
                        console.log(noteKeys)
                        // console.log(indexOf(noteKeys))

                        let noteValues = Object.values(snapshot.val()) //FETCH DEI VALUES DELLE NOTE DA FIREBASE E CONVERSIONE DELL'OGGETTO IN ARRAY
                        console.log(noteValues)
                        
                        // const cardToRemove = noteValues.find(card => card.uuid === uuid)
                        // console.log(cardToRemove)

                        noteKeys.forEach(key => {
                            
                            console.log(key)
                            console.log('Chiave da rimuovere: ', key);

                            let exactLocationOfItemInDB = ref(database, `notes/${key}`)
                            console.log(exactLocationOfItemInDB)

                            // remove(key)     
                                       

                        })
                    }


                    

                    // let notes = Object.values(snapshot.val()) //FETCH DEI VALUES DELLE NOTE DA FIREBASE E CONVERSIONE DELL'OGGETTO IN ARRAY


                    // for (let i = 0; i < notes.length; i++) {

                    //     let currentItem = notes[i]
                    //     console.log(currentItem)

                    //     const cardToRemove = cardArr.find(card => card.uuid === _uuid)


                    //     let currentItemID = currentItem.uuid
                    //     console.log(currentItemID)
                    //     const locationInDB = ref(database, `notes/${itemToRemove}`)
                    //     remove(locationInDB)
                    // }
                })
            
        })    

    })
}

