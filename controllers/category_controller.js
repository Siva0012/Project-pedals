const Admin = require('../models/admin_model')
const Products = require('../models/products_model')
const Categories = require('../models/category_model')
const Users = require('../models/user_model')
const moment = require('moment')
const Swal = require('sweetalert2')

/*------------------------post method for add category-------------------------*/
const insertCategory = async (req , res , next) =>{

    try{
        const catName = req.body.name
        console.log('this is catName in server sideeeee' , catName);
        const existsCat = await Categories.findOne({name : {$regex : new RegExp( catName , "i" )}})
        
        if(existsCat){
            // res.render('add_categories' , {dupError : 'Category already exists'})
            // dupError = undefined
            res.json({error : 'Category already exists!!' })
        }else{
            const category = new Categories(
                {
                    name : req.body.name,
                    description : req.body.description,
                }
            )
            const categoryData = await category.save()/* Saving document to database*/
            if(categoryData){

                // res.redirect('/admin/viewcategories')
                res.json({message : `'${catName}' added successfully!`})
                
            }else{
                // res.redirect('/admin/viewcategories')
                res.json({error : `Error occured while adding category!`})
            }
        }
        
    }
    catch(error){
        next(error)
        console.log(error.message);
    }
}

/*--------------------get for delete category----------------*/
const deleteCategory = async (req , res , next) =>{

    try{
        
        const categoryId = req.params.id
        await Categories.deleteOne({_id : categoryId})

        res.redirect('/admin/viewcategories')
        
    }
    catch(error){
        next(error)
        console.log(error.message);
    }
}

/*---------------------get method for view categories----------------------*/
const viewCategories = async (req , res , next) =>{

    try{

        const categoryData = await Categories.find({}).exec()

        res.render('view_categories' , {categoryData : categoryData , moment : moment})
    }
    catch(error){
        next(error)
        console.log(error.message);
    }
}





module.exports = {
    insertCategory,
    deleteCategory,
    viewCategories,
    
}