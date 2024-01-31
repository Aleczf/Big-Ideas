
//  FIREBASE STUFF
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js"
import { getDatabase, onValue, push, ref, set, remove } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js"

const appSettings = {
    databaseURL: "https://big-ideas-3d5f2-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const notesInDB = ref(database, "notes")
let notesArray = []
let notes = []

const container = document.getElementById('container')
const overlay = document.getElementById("overlay")
const card = document.getElementById("card")
let cardArr = []



onValue(notesInDB, (snapshot) => {

    container.innerHTML = ''   //RIPULISCO IL CONTANIER PRIMA DI AGGIUNGERE LE NOTE
    notes = Object.values(snapshot.val()) //FETCH DEI VALUES DELLE NOTE DA FIREBASE E CONVERSIONE DELL'OGGETTO IN ARRAY
    notesArray = Object.entries(snapshot.val())
    console.log(notesArray)

    updateUI()
    
})




function updateUI() {
    container.innerHTML = ''   //RIPULISCO IL CONTANIER PRIMA DI AGGIUNGERE LE NOTE                 
    
    notes.forEach((nota) => {
        createCard(nota.title, nota.content, nota.uuid)
        // console.log(nota.uuid)
    })
}

document.addEventListener('DOMContentLoaded', updateUI) //faccio riferimento ad updateUI al caricamento del dom ma senza invocarla




function createCard(_title = 'Titolo', _content = '', uuid) {

    //CREO NUOVA CARD    
    const newCard = document.createElement('div')
    newCard.id = 'card'
    newCard.className = 'card'

    // CREO NUOVO UUID E LO ASSEGNO AD OGNI CARD CREATA
    if(typeof uuid === 'undefined') {
        uuid = Math.floor(Math.random() * 10000000)
    }
    newCard.setAttribute ('data-uuid', uuid) 

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
    let uuid = card.getAttribute('data-uuid')
    if (!uuid) {
        // Se la card non ha un UUID, generane uno e assegnalo
        uuid = Math.floor(Math.random() * 10000000)
        card.setAttribute('data-uuid', uuid)
        console.log(card.uuid)
    }

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



// function editFirebaseNote(editedNote){
//     const noteRef = ref(database, `notes/${editedNote.uuid}`)
//     set(noteRef, editedNote)
//     console.log('Nota aggiornata su Firebase')
// }



// SALVO NUOVA NOTA O MODIFICO SE PREESISTENTE
function saveNote(selectedCard) {

    let _uuid = parseInt(selectedCard.getAttribute('data-uuid')) //ASSOCIO L'UUID E LO TRASFORMO DA STRINGA A NUMERO
    let _title = selectedCard.querySelector('.title-card').innerText
    let _content = selectedCard.querySelector('.content-card').innerText
    
    const existingCard = notesArray.find((card) => card[1].uuid === _uuid)
    console.log(existingCard)

    if(existingCard) {
        let noteToEdit = existingCard[1]
        console.log(noteToEdit)
        
        let noteEdited = {
            title : _title,
            content : _content,
            uuid : _uuid
        }
        console.log(noteEdited)


        let noteIDToEdit = existingCard[0]

        let exactLocationOfItemInDB = ref(database, `notes/${noteIDToEdit}`)
        set(exactLocationOfItemInDB, noteEdited)


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
            // updateUI();
        }

        const expandedCard = document.querySelector('.card.expanded');
        if (!expandedCard) {
            overlay.style.display = "none";
        }
    });
}



function deleteNote(){

    const deleteBtns = document.querySelectorAll('.delete-btn')

    deleteBtns.forEach(deleteBtn => {
        deleteBtn.addEventListener('click', (event) => {
            event.stopImmediatePropagation() 
    
            const uuid = deleteBtn.getAttribute('data-uuid')
            // const selectedCard = event.target.closest('.card')     
    
                onValue(notesInDB, (snapshot) => {
                    
                    if (notesInDB) {
                        let noteIDToDelete
                        let notesArrFromDB = Object.entries(snapshot.val()) //FETCH DEI VALUES DELLE NOTE DA FIREBASE E CONVERSIONE DELL'OGGETTO IN ARRAY
                        
                        for (let nota of notesArrFromDB){

                            if(nota[1].uuid === uuid){
                                console.log(nota[0])
                                noteIDToDelete = nota[0]
                            } 

                            let exactLocationOfItemInDB = ref(database, `notes/${noteIDToDelete}`)
                            remove(exactLocationOfItemInDB)                                     
                        
                        }                        
                    }
                })            
        })    
    })
}







// let arr = [
    
//         {
//             0: "432432",
//             1: {
//                 titolo: 'abc',
//                 content: 'def',
//                 uuid: 153167816
//             }
//         },
//         {
//             0: "5381832",
//             1: {
//                 titolo: 'abc',
//                 content: 'def',
//                 uuid: 789468
//             }
//         },
//         {
//             0: "08161",
//             1: {
//                 titolo: 'abc',
//                 content: 'def',
//                 uuid: 123456
//             }
//         },
//         {
//             0: "86414684",
//             1: {
//                 titolo: 'abc',
//                 content: 'def',
//                 uuid: 4534186
//             }
//         }
// ]

// const uuidProva = 123456

// let prova = arr.find((item) => trovaUuid(item))

// function trovaUuid(item) {
//     console.log(item[1].uuid)
//     return item[1].uuid === uuidProva    
// }



// console.log(prova)
