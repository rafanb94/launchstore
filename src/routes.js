const express = require('express') // chama o express para aplicação
const routes = express.Router()//chama o módulo de rotas do express
const ProductController = require("./app/controllers/ProductController")

routes.get('/', function(request, response){ 
    return response.render("template.njk") //sempre que requisitarmos pelo / na aplicação, irá renderizar a página de template.
})

routes.get('/produtos/cadastrar', ProductController.create)  
    //No primeiro parametro do get será a URL que o usuário irá acessar 
    // Neste caso estamos chamando a funcao ' Create' que está no ProductController para executar a ação de chamar a página de criação do cadastro do produto.

    //URL:/produtos/cadastrar' para entrar nessa rota, porém, a resposta(response) deve retornar o nome exato do arquivo ("layout.njk") para poder renderizar as páginas.
routes.post('/produtos', ProductController.post)

//Alias
routes.get('/novo-anuncio/cadastrar', function(request, response){
    /** No primeiro parametro do get será a URL que o usuário irá acessar
    URL:/anuncio/cadastrar para entrar nessa rota, porém, a resposta(response) deve redirecionar para a página de criação de produtos, nesse caso ("/produtos/cadastrar")*/
    return response.redirect("/produtos/cadastrar")
})

module.exports = routes // disponibiliza a rota para aplicação