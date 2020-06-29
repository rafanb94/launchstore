const multer = require('multer');

/** armazenamos na variavel storage a função 'multer.diskStorage que fará o armazanamento das imagens localmente,ou seja, em disco. */
const storage = multer.diskStorage({
    destination: (request, file, callback) => { //? em destination passamos um callback com o destino em que as imagens serão armazenadas.
        callback(null, './public/images')
    },
    filename: (request, file, callback) => { //? em filename passamos outro callback com o nome que a imagem será armazenada.Usamos a função Date.now() para matermos as imagens com um nome unico. 
    //? Ao passarmos file como parametro, temos acesso a algumas funções do multer, onde chamaos a originalname que pegará o nome do arquivo.
        callback(null,`${Date.now().toString()}-${file.originalname}`)
    }

})

/** Armazenamos  na variavel fileFilter a função que irá validar os tipos da imagem, passando file e uma callback como parametros */
const fileFilter = (request, file, callback) => {
const isAccepted = ['image/png', 'image/jpg','image/jpeg']//definimos um array com os tipos aceitaveis
.find(acceptedFormat => acceptedFormat == file.mimetype)//usamos a função find para percorrer o array e comparar os itens enviados com os tipos aceitos, isso é possivel graças a função 'mimetype' do multer.
    if(isAccepted){
        return callback(null, true)
    }
    return callback(null, false)
}

module.exports  = multer({
storage,
fileFilter

})