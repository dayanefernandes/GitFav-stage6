import {GithubUser} from "./githubUser.js"

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()
    }

    load() {
        const users = JSON.parse(localStorage.getItem('@github-favorites:')) || []

        this.users = users
        console.log(this.users, "blablau")
    }

    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.users))
    }

    async add(username) {
        try {
            const userExists = this.users.find(entry => (entry.login === username || 
                                                         entry.login === username.charAt(0).toUpperCase() + username.substr(1) ||
                                                         entry.login === username.charAt(0).toLowerCase() + username.substr(1)))

            if(userExists) {
                throw new Error('Usuário já favoritado!')
            }

            const userGit = await GithubUser.search(username)

            if(userGit.login === undefined) {
                throw new Error('Usuário informado não foi encontrado!')
            }
            
            this.users = [userGit, ...this.users]
            this.update()
            this.save()
            
        }  catch(error) {
            alert(error.message)
        }
    }

    delete(item){
        const filterUsers = this.users.filter(start => start.login !== item.login)

        this.users = filterUsers
        this.update()
        this.save()
    }
}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)
        this.body = this.root.querySelector('tbody')
        this.update()        
        this.toadd()
    }

    toadd() {
        const addButton = this.root.querySelector('#search button')
        addButton.onclick = () => {
            const {value} = this.root.querySelector('#search input')
            this.add(value)
        }
    } 

    update() {
        this.removeTheLines()
       
        this.users.forEach( item => {

            const rowNew = this.createLine()
           
            rowNew.querySelector('.user img').src = `https://github.com/${item.login}.png`
            rowNew.querySelector('.user img').alt = `Imagem de ${item.name}`
            rowNew.querySelector('.user a').href = `https://github.com/${item.login}`
            rowNew.querySelector(`.user p`).textContent = item.name
            rowNew.querySelector(`.user span`).textContent = item.login
            rowNew.querySelector(`.repositories`).textContent = item.public_repos
            rowNew.querySelector(`.followers`).textContent = item.followers

            rowNew.querySelector(`strong`).onclick = () => {
                const ok = confirm('Tem certeza que deseja remover esse favorito?')
                if(ok) {
                    this.delete(item)
                }
            }

            this.body.append(rowNew)
        })
    }

    createLine() {
        const line = document.createElement('tr')

        const data = `
            <td class="user" colspan="4">
                <img src="" alt="">
                <a href="" target="_blank">
                <p> </p>
                <span> </span>
                </a>
            </td>
            <td class="repositories"> </td>
            <td class="followers"> </td>
            <td>
                <strong>Remover</strong>
            </td> ` 
            
            line.innerHTML = data
            return line
        }

    finalMessage() {
        const lineStar = document.createElement('tr')
        const finalStar = 
            `   <td class="finalStar" colspan="4">
                    <div>
                        <img src="./images/Estrela.svg" alt="">
                        <span>Nenhum favorito ainda</span>
                    </div>
                </td>
                
            `
        lineStar.innerHTML = finalStar
        this.body.append(lineStar)
    }
    

    removeTheLines() {
        const lines = this.body.querySelectorAll('tr')

        if (this.users.length === 0) {
            this.finalMessage()
        }

        lines.forEach((tr) => {
            tr.remove()
        })
    }   
}