const { formatPrice } = require ('../../lib/utils')

const Category = require('../models/Category')
const Product = require('../models/Product')

module.exports = {
// exportar os objetos para aplicação

//? Async Await é método mais evoluido do que as Promises, com ele não precisamos fazer uma cadeia de promises, ele primeiro vai aguardar uma função ser realizada para dar sequencia na aplicação.

create(request, response) {
    //Pegar todas as categorias
    Category.all()
    .then(function(results){ //Enviamos results como parametros para que possamos obter os resultados que vão vir da busca realizada pela função 'all' na Model Category. 
   
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
       
    let results = await Product.create(request.body) /**Chamamos a Model Product para termos acesso a função 'create'  que salvará os dados no banco, estamos passando o request.body como parametro pois é nele que se encontra os valores dos campos.

    Esperamos a função 'create' da Model Product ser realizada para dar sequencia, e o resultado da função 'create' está armazenado na let results.*/
    const productId = results.rows[0].id//? rows é um array, onde estamos acessando a primeira possição para retornar um ID que neste caso estamos armazendo ele na variavel productID.

        return response.redirect(`/produtos/${productId}`)/**Após o save no banco de dados, iremos redirecionar o usuário para página de produto que ele acabou de cadastrar. A primeira parte da URL do redirect deve ser a mesma que está definida nas 'routes.post' 
        
        Ao passarmos ${productId} como segundo parametro no redirect, estamos enviando para a URL, o ID do produto que acabamos de cadastrar.
        */
    },
async edit (request, response){

    let results = await Product.find(request.params.id)//? request.params.id são os dados do formulário que são enviados na url.
    /** Chamamos a Model Product para termos acesso a função 'find' que buscara os dados no banco, estamos passando o request.params.id como parametro pois é nele que se encontra o valor do ID que precisamos para a função 'find' comparar com os valores já cadastrados no banco.

    Esperamos a função 'find' da Model Product ser realizada para dar sequencia, e o resultado da função 'find' está armazenado na let results.*/

    const product = results.rows[0]//? colocamos rows[0] para pegarmos apenas 1 resultado.
    console.log(product)
    // Estamos armazendo em product, o primeiro resultado da função 'find' da Model Product, neste caso, estamos retornado um ID do produto.
    
    if (!product) return response.send("Produto não encontrado - Backend")
    
    product.old_price = formatPrice(product.old_price)//? formatação do preço quando os dados vieram do banco
    product.price = formatPrice(product.price)//? formatação do preço quando os dados vieram do banco

     results = await Category.all()
    /** Chamomos a Model Category para termos acesso a função 'all' que retorna do banco todas as categorias existentes.
    
    Esperamos a função 'all' da Model Category ser realziada para dar sequencia, o resultado da função 'all' é armazenado na variavel results
    */
   const categories = results.rows // Estamos armazendo em categories, todos os resultados da função 'all' da Model Category, neste caso, todos as categorias que existem no banco.

    return response.render("products/edit.njk", { product, categories })
    //Ao usarmos render no return, como primeiro paramatro devemos enviar a página a qual será renderizada e como segundo parametro,  enviamos procut e categories para o front-end para termos acesso as informações.
    },
async put (request, response){
    const keys = Object.keys(request.body)
    
    // a constante 'keys' está armazendo em um array, todos os dados que estão vindo do request.body, no caso, os dados a serem salvos que foram digitados no input da página "products/create.njk"
 
   for(key of keys) { //Aqui é feito um for para verificar todas as chaves dos campos do formulário e verificar se existe algum vázio, caso exista, o servidor responde que é necessário preencher todos os campos.
        if (request.body[key] == ""){
            return response.send("Preencha todos os Campos - Backend")

            }
        }
    request.body.price = request.body.price.replace(/\D/g, "")//? pegamos o valor do input price e limpamos para mandarmos de forma correta para o banco.

    if (request.body.old_price != request.body.price) {
        const oldProduct = await Product.find(request.body.id)
        request.body.old_price = oldProduct.rows[0].price
    }/**
    Logica para obtermos o preço antigo, caso o preço antigo seja diferente do novo preço enviado.
    Armazenamos na variavel oldProduct o resultado da função 'find' da Model Product que ira retornar o id.
    
    Após isso armazenamos o valor encontrado no request.body.old_price
    */
    await Product.update(request.body)

    return response.redirect(`/produtos/${request.body.id}/editar`)
},
async delete(request, response){
    await Product.delete(request.body.id)
    // Aqui chamamos o Model Product para  termos acesso a função "delete", passando como paramatro o ID do produto atraves da URL, a aplicação aguarda até que o delete seja feito para prosseguir.

    return response.redirect('/produtos/cadastrar')
}
}
