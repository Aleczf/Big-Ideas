
export default class NoteManager {


//     constructor() {
//         // this.cardArr = []
//         this.container = document.getElementById('container')
//     }
    

    // static createCard(_title = 'Titolo', _content = '') {

    //     //CREO NUOVA CARD    
    //     const newCard = document.createElement('div')
    //     newCard.id = 'card'
    //     newCard.className = 'card'

    //     // CREO NUOVO ID E LO ASSEGNO AD OGNI CARD CREATA
    //     const uuid = Math.floor(Math.random() * 10000000)
    //     newCard.setAttribute ('data-uuid', uuid) 

    //     //CREO TITOLO DA INSERIRE NELLA CARD
    //     const title = document.createElement('h2')
    //     title.id = 'title-card'
    //     title.className = 'title-card'
    //     title.contentEditable = true
    //     title.textContent = _title

        
    //     //CREO TEXTAREA DA INSERIRE NELLA CARD
    //     const content = document.createElement('div')
    //     content.id = 'content-card'
    //     content.className = 'content-card'
    //     content.contentEditable = true
    //     content.textContent = _content

    //     newCard.appendChild(title)
    //     newCard.appendChild(content)
    
    //     container.insertAdjacentElement('afterbegin', newCard)
    
    // }

    
    




    // static saveNote(selectedCard) {

    //     const cardArr = []

    //     let _uuid = selectedCard.dataset.uuid
    //     let _title = selectedCard.querySelector('.title-card')
    //     let _content = selectedCard.querySelector('.content-card')

    //     // if(cardArr.length >= 0){
            
    //         const existingCard = cardArr.find(card => card.uuid === _uuid)
    //         const existingCardIndex = cardArr.findIndex(card => card.uuid === _uuid)
            
            
    //             if(existingCardIndex >= 0){
                
    //                 cardArr[existingCardIndex].title = _title.textContent
    //                 cardArr[existingCardIndex].content = _content.textContent
                    
    //                 console.log(cardArr[existingCardIndex])

    //             } else {

    //                 const newNote = {
    //                     uuid : _uuid,
    //                     title : _title,
    //                     content : _content
    //                 }
    //                 cardArr.push(newNote)
    //                 console.log(_content)
    //                 console.log(_title)
    //             }
        
    //     console.log(cardArr)

    //     return

    // }



//     static saveOnFocusOut(myCard) {
//         myCard.addEventListener('focusout', () => {
//             this.saveNote(myCard)
//         })
//     }


//     static deleteCard(id) {

//     }

}