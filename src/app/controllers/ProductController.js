const Category = require('../models/Category')
const Product = require('../models/Product')
module.exports = {
// exportar os objetos para aplicação

//? Async Await é método mais evoluido do que as Promises, com ele não precisamos fazer uma cadeia de promises, ele primeiro vai aguardar uma função ser realizada para dar sequencia na aplicação.

create(request, response) {
    //Pegar todas as categorias
    Category.all()
    .then(function(results){ //Enviamos results como parametros para que possamos obter os resultados que vão vir da busca realizada pela função all() na Model Category. 
   
    const categories = results.rows // 'rows' é um array, neste caso que está armazenando as categorias, que foram buscadas no banco de dados e estão sendo armazenadas na constante categories

    return response.render("products/create.njk", {categories})// Ao passarmos {categories} no return, estamos enviando os resultados da busca para que possa ser acessado do frontend, ou no caso, a página que está sendo renderizada.

    //URL:/produtos/cadastrar' para entrar nessa rota, porém, a resposta(response) deve retornar o nome exato do arquivo ("products/create.njk") para poder renderizar as páginas.

    }).catch(function(err){
        throw new Error(err)
    })
},
async post (request, response){
    //lógica de salvar
    const keys = Object.keys(request.body)
    
    // a constante 'keys' está armazendo em um array, todos os dados que estão vindo do request.body, no caso, os dados a serem salvos que foram digitados no input da página "products/create.njk"
    console.table(keys)
    for(key of keys) { //Aqui é feito um for para verificar todas as chaves dos campos do formulário e verificar se existe algum vázio, caso exista, o servidor responde que é necessário preencher todos os campos.
        if (request.body[key] == ""){
            return response.send("Preencha todos os Campos - Backend")

            }
        }
       let results = await Product.create(request.body)

       //Chamamos a Model Product para termos acesso a função create  que salvará os dados no banco, estamos passando o request.body como parametro pois é nele que se encontra os valores dos campos.

       //Esperamos a função 'create' da Model Product ser realizada para dar sequencia, e o resultado da função 'create' está armazenado na let results.
       const productId = results.rows[0].id

       
       // estamos armazendo em product, o primeiro resultado da função create da Model Product, neste caso, estamos retornado um ID do produto.

        results = await Category.all()
        const categories = results.rows

        return response.render("products/create.njk", { productId, categories })
    }
}
