const express = require('express') // chama o express para aplicação
const routes = express.Router()//chama o módulo de rotas do express
const multer = require('./app/middlewares/multer')
const ProductController = require("./app/controllers/ProductController")

routes.get('/', function(request, response){ 
    return response.render("template.njk") //sempre que requisitarmos pelo / na aplicação, irá renderizar a página de template.
})

routes.get('/produtos/cadastrar', ProductController.create)  
    /**No primeiro parametro do get será a URL que o usuário irá acessar 
    Neste caso estamos chamando a funcao ' Create ' que está no ProductController para executar a ação de chamar a página de criação do cadastro do produto.*/

    /**URL:/produtos/cadastrar' para entrar nessa rota, porém, a resposta(response) deve retornar o nome exato do arquivo ("layout.njk") para poder renderizar as páginas.*/
routes.get('/produtos/:id', ProductController.show)//exibe a página do produto do ID especificado.
routes.get('/produtos/:id/editar', ProductController.edit)//exibe a página do produto do ID especificado.

routes.post('/produtos', multer.array("photos", 6), ProductController.post)
    /*No primeiro parametro estamos passando a URL que sera usada no Action do formulário na parte de salvar.
    Ao darmos submit no formulário, sera chamada a função ' POST ' que enviara os dados para o banco.
    
    //! Antes da nossa aplicação prosseguir para o ProductController, ele ira passar pelas configurações do multer para validar os arquivos enviados.
    */
routes.put('/produtos', multer.array("photos", 6), ProductController.put)
    /*No primeiro parametro estamos passando a URL que sera usada no Action do
    formulário na hora de editar/salvar. 
    Ao darmos submit no formulário, sera chamada a função 'PUT', que salvara a alteração e mandara os dados atualizados para o banco. 
     
    //! Antes da nossa aplicação prosseguir para o ProductController, ele ira passar pelas configurações do multer para validar os arquivos enviados.

    */
routes.delete('/produtos',ProductController.delete)

//Alias
routes.get('/novo-anuncio/cadastrar', function(request, response){
    /** No primeiro parametro do get será a URL que o usuário irá acessar
    URL:/anuncio/cadastrar para entrar nessa rota, porém, a resposta(response) deve redirecionar para a página de criação de produtos, nesse caso ("/produtos/cadastrar")*/
    return response.redirect("/produtos/cadastrar")
})

module.exports = routes // disponibiliza a rota para aplicação