module.exports = (res, req, next) => {
    //pass anything through
    try {
        next()
    } catch (error) {
        return res.status(404).json({error: '**Need auth**'})
    }
}