const AppError = require("../utils/AppError");

const restrictTo = (...roles) =>{
    return (req,res,next)=>{
        const user = req.user
        if(!roles.includes(user.role)){
            throw new AppError("Forbidden",403)
        }
        next()
    }
}

module.exports=restrictTo