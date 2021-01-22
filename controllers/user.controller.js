exports.publicBoard = async (req, res, next) =>{
    res.status(200).send('Public Board')
}

exports.userBoard = async (req, res, next) =>{
    res.status(200).send('LoggedIn User Board')
}

exports.modBoard = async (req, res, next) =>{
    res.status(200).send('Moderator Board')
}

exports.adminBoard = async (req, res, next) =>{
    res.status(200).send('Admin Board')
}