
const isLogIn = async (req , res , next) =>{

    try{
        if(req.session.admin_id){

        }else{
            
            return res.redirect('/admin')
        }
        next()
    }catch(error){
        
        console.log(error.message);
    }

}

const isLogOut = async (req , res , next) =>{

    
    try{
        if(req.session.admin_id){
            
            return res.redirect('/admin/adminPanel')
        }
        next()
    }catch(error){
        
        console.log(error.message);
    }

}

const adminLogout = async (req , res , next) =>{

    try{
        req.session.admin_id = null
        res.redirect('/admin')
    }catch(error){
        console.log(error.message);
    }
}

module.exports = {
    isLogIn,
    isLogOut,
    adminLogout
}