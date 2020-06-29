function onlyRegisteredUsers (request, response, next){

    if(!request.session.userId) 
       return  response.redirect('/users/login')

        next()
}

function isLogged (request, response, next){
    if(request.session.userId) 
    return response.redirect('/users')
    next()
}


module.exports = {
onlyRegisteredUsers,
isLogged
}