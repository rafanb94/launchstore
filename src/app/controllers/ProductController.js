const { formatPrice, date } = require ('../../lib/utils')

const Category = require('../models/Category')
const Product = require('../models/Product')
const File = require('../models/File')

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

    for(key of keys) { //Aqui é feito um for para verificar todas as chaves dos campos do formulário e verificar se existe algum vázio, caso exista, o servidor responde que é necessário preencher todos os campos.
        if (request.body[key] == ""){
            return response.send("Preencha todos os Campos - Backend")

            }
    }

    if(request.files.length == 0) 
    return response.send('Por favor, envie pelo menos uma imagem - Backend')
       
    let results = await Product.create(request.body) /**Chamamos a Model Product para termos acesso a função 'create'  que salvará os dados no banco, estamos passando o request.body como parametro pois é nele que se encontra os valores dos campos.

    Esperamos a função 'create' da Model Product ser realizada para dar sequencia, e o resultado da função 'create' está armazenado na let results.*/
    const productId = results.rows[0].id//? rows é um array, onde estamos acessando a primeira possição para retornar um ID que neste caso estamos armazendo ele na variavel productID.

    const filesPromise = request.files.map(file => File.create({ //dentro da variavél filesPromise um array com os arquivos que são enviados pelo usuário,  os arquivos são criados pela função 'create' na model File
        ...file,
        product_id: productId
    }))
    await Promise.all(filesPromise)//Fazemos um array de promesas para que possamos aguardar enquanto todas as imagens são enviadas/criadas para o banco e assim retornar a página para o usuario no response.


    return response.redirect(`/produtos/${productId}/editar `)/**Após o save no banco de dados, iremos redirecionar o usuário para página de produto que ele acabou de cadastrar. A primeira parte da URL do redirect deve ser a mesma que está definida nas 'routes.post' 
        
    Ao passarmos ${productId} como segundo parametro no redirect, estamos enviando para a URL, o ID do produto que acabamos de cadastrar.
    */



    },
async show(request, response){

    let results = await Product.find(request.params.id)
    const product = results.rows[0]
    /**
     * Armazenamos na variavel results o resultado da função 'find' na Model  Product passando o id do produto pela URL.
     * Usamos rows[0] para retornar um unico valor e armazenamos ele na variavel product.
     */

    if(!product) return response.send("Produto não encontrado - Backend")

    const { day, hour, minutes, month} = date(product.updated_at) // aqui pegamos apenas day, hour, minutes e month da função date e passamos como parametro para dentro dela o product.updated_at
    
    //TODO verificar o que o objeto abaixo está fazendo. Aula: Dados para apresentação de produtos. Tempo do video: 2:40
    product.published = {
        day:`${day}/${month}`,
        hour:`${hour}h${minutes}`,
    }
    product.oldPrice = formatPrice(product.old_price) // passando o preço recebido do banco e devolvendo ele formatado
    product.price = formatPrice(product.price)// passando o preço recebido do banco e devolvendo ele formatado

    results = await Product.files(product.id) // dentro de results armazenamos o resultado da função 'files' da Model Product, passando o product.id como parametro, caso o product_id da tabela Files seja igual o product.id da tabela de Products, ele ira retornar os arquivos.

    const files = results.rows.map(file => ({//a variavel files  está recebendo o resultado do map, onde estavam os resultados do banco anteriormente, para cada file individualmente, estamos arrumando a url para podermos ler as imagens no front.
       ...file,
        src:`${request.protocol}://${request.headers.host}${file.path.replace("public","")}`
        /**
        * ${request.protocol} = http ou https
        * ${request.headers.host} = localhost:3000
        * {file.path.replace("public","")} = caminho da imagem, retirando o nome da pasta public, que é o diretório anterior onde estão armazenadas.
        */
    }))

    return response.render("products/show", { product, files })
},
async edit (request, response){

    let results = await Product.find(request.params.id)//? request.params.id são os dados do formulário que são enviados na url.
    /** Chamamos a Model Product para termos acesso a função 'find' que buscara os dados no banco, estamos passando o request.params.id como parametro pois é nele que se encontra o valor do ID que precisamos para a função 'find' comparar com os valores já cadastrados no banco.

    Esperamos a função 'find' da Model Product ser realizada para dar sequencia, e o resultado da função 'find' está armazenado na let results.*/

    const product = results.rows[0]//? colocamos rows[0] para pegarmos apenas 1 resultado.

    // Estamos armazendo em product, o primeiro resultado da função 'find' da Model Product, neste caso, estamos retornado um ID do produto.
    
    if (!product) return response.send("Produto não encontrado - Backend")
    
    product.old_price = formatPrice(product.old_price)//? formatação do preço quando os dados vieram do banco
    product.price = formatPrice(product.price)//? formatação do preço quando os dados vieram do banco

     results = await Category.all()
    /** Chamomos a Model Category para termos acesso a função 'all' que retorna do banco todas as categorias existentes.
    
    Esperamos a função 'all' da Model Category ser realziada para dar sequencia, o resultado da função 'all' é armazenado na variavel results
    */
   const categories = results.rows // Estamos armazendo em categories, todos os resultados da função 'all' da Model Category, neste caso, todos as categorias que existem no banco.

   results = await Product.files(product.id)

   let files = results.rows // Estamos armazenando em files, o resultado da busca da função 'files' da Model Product, neste caso, retornando todas as imagens referentes ao ID do produto que foi passado.

   files = files.map(file =>({ // a variavel files  está recebendo o resultado do map, onde estavam os resultados do banco anteriormente, para cada file individualmente, estamos arrumando a url para podermos ler as imagens no front.
       ...file,
       src:`${request.protocol}://${request.headers.host}${file.path.replace("public","")}`
       /**
        * ${request.protocol} = http ou https
        * ${request.headers.host} = localhost:3000
        * {file.path.replace("public","")} = caminho da imagem, retirando o nome da pasta public, que é o diretório anterior onde estão armazenadas.
        */
    }))

    return response.render("products/edit.njk", { product, categories, files })
    //Ao usarmos render no return, como primeiro paramatro devemos enviar a página a qual será renderizada e como segundo parametro,  enviamos product ,categories, files para o front-end para termos acesso as informações.
    },
async put (request, response){
    const keys = Object.keys(request.body)
    
    // a constante 'keys' está armazendo em um array, todos os dados que estão vindo do request.body, no caso, os dados a serem salvos que foram digitados no input da página "products/create.njk"
 
   for(key of keys) { //Aqui é feito um for para verificar todas as chaves dos campos do formulário e verificar se existe algum vázio, caso exista, o servidor responde que é necessário preencher todos os campos.
        if (request.body[key] == "" && key != "removed_files"){
            return response.send("Preencha todos os Campos - Backend")

            }
        }
    if(request.files.length !=0) { //se imagens forem enviadas na atualização do produto
        const newFilesPromise = request.files.map(file =>// a variavel newsFilesPromise está recebendo o resultado do map, onde estavam os resultados do banco anteriormente, para cada file individualmente, estamos fazendo a criação/envio dos arquivos para o banco/pasta.
     File.create({...file, product_id: request.body.id}))
    //TODO verificar o construtor Promise e entender melhor o funcionamento Aula: Array de promessas com Promise.all()
     await Promise.all(newFilesPromise)
    }
    
    if(request.body.removed_files) {
        const removedFiles = request.body.removed_files.split(",")
        const lastIndex = removedFiles.length - 1
        removedFiles.splice(lastIndex, 1) 

        const removedFilesPromise = removedFiles.map(id => File.delete(id))
        await Promise.all(removedFilesPromise)
    }//Se tiverem arquivos removidos no front, o index da imagem ficara salvo na div removed_files, em seguida sera executado um map, para cada arquivo removido será verificado o ID e passando para a função 'delete'  na Model File, fazendo com o arquivo suma de fato tanto do front-end, quanto do banco e pasta.

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

    return response.redirect(`/produtos/${request.body.id}`)
},
async delete(request, response){
    await Product.delete(request.body.id)
    // Aqui chamamos o Model Product para  termos acesso a função "delete", passando como paramatro o ID do produto atraves da URL, a aplicação aguarda até que o delete seja feito para prosseguir.

    return response.redirect('/produtos/cadastrar')
}
}
