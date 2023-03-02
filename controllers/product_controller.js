const Admin = require('../models/admin_model')
const Products = require('../models/products_model')
const Categories = require('../models/category_model')
const Users = require('../models/user_model')
const path = require('path')
const fs = require('fs')

/*----------------------------post method for inserting products to database------------------*/
const insertProduct = async (req , res , next) =>{  

    try{

        const proName = req.body.name
        const existsPro = await Products.findOne({ name : {$regex : new RegExp(proName , "i")}})
        if(existsPro){
            res.redirect('/admin/addProducts')
        }else{
            uploadedImages = req.files /* assigning req.files from multer to a variable*/
       const imageName = [] /* creating array for storing imagename*/
       uploadedImages.forEach(element => { /* adding image name to array */
            imageName.push(element.filename)
       });
       const catData = await Categories.findOne({ _id : req.body.category})
       
        const product = new Products(

            {
                name : req.body.name,
                price : req.body.price,
                stock : req.body.stock,
                images : imageName,
                description : req.body.description,
                category : req.body.category,
                categoryName : catData.name
            }
        )

        const productData = await product.save()/* Saving document to database*/

        if(productData){
            res.redirect('/admin/viewproducts')
        }else{
            res.render('add_products')
        }
        }
        
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*--------------------get method for delete product------------------------*/
const deleteProduct = async (req , res , next) =>{

    try {
        
        const productId = req.params.id
        await Products.deleteOne({_id : productId})
        res.redirect('/admin/viewproducts')
        
    } catch (error) {
        next(error)
        console.log(error.message);
    }
    
}

/*------------------------------Listing products from database--------------------------------*/
const viewProducts = async (req , res , next) =>{
    
    try{
        
        const productData = await Products.find({}).exec() /* find all products to list in view_products*/
        res.render('view_products' , {productData}) /* listing products */
    }catch(error){
        next(error)
        console.log(error);
    }
}

/*---------------------Edit product----------*/
const viewEditProduct = async (req , res , next) =>{
    
    try{
        const productId = req.params.id
        const categoryData = await Categories.find({})
        const productData =await Products.find({ _id : productId})
        const imageData = await Products.findOne({_id : productId})
        console.log('this is pro id' , imageData._id);
        res.render('edit_product' , {categoryData : categoryData , imageData : imageData})
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

const deleteProductImages = async (req , res , next) =>{
    try{
        const productId = req.params.productId
        const imageName = req.params.imageName
        const imagePath = path.join(__dirname , '../public/product_images' , imageName)
        console.log("this is imagepath",imagePath);

        const productData =await Products.findByIdAndUpdate(
            productId,
            {$pull : {images : imageName}},
            {new : true}
        )
        console.log('this is new productData',productData);
        
        fs.unlink(imagePath , (err)=>{
            if(err){
                console.log("error in fs function",err);
                res.status(500).json({ message: "Error deleting image" })
            }else{
                console.log('deleted image');
                res.json({ message: "Image deleted" })
            }
        })
        
        // res.redirect('/admin/viewproducts')
    }catch(error){
        next(error)
        console.log(error.message);
        res.status(500).json({ message: "Error deleting image" })
    }
}

const updateProduct = async (req , res , next) =>{
    try{    
            const formData = req.body
            console.log('thsi is req body in updateProduct' , formData);
            console.log('this is nameeeeeeeeeeeeeeeeeeee' , req.body.name);
            if(formData.description == ''){
                await Products.findOne({_id : formData.proId})
                .then((response) =>{
                    formData.description = response.description
                })
            }
            const catData = await Categories.findOne({_id : formData.category})
            const update = {
                name : formData.name,
                price : formData.price,
                stock : formData.stock,
                description : formData.description,
                category : formData.category,
                categoryName : catData.name
            }
            const productData = await Products.findOneAndUpdate({ _id : formData.proId} , update , {new : true})
            res.redirect('/admin/viewProducts')
        
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

const updateProductImage = async (req , res , next) =>{

    try{    
            /*-----image upload file-----*/
            const imageFiles = req.files
            const imageArrayLength = imageFiles.length

            /*-----database image array-------*/
            const productId = req.body.proId
            const productData = await Products.findOne({ _id : productId})
            const dataArraylength = productData.images.length
            if(dataArraylength + imageArrayLength <= 4){
                const images = []
                imageFiles.forEach((imageFiles) =>{
                    images.push(imageFiles.filename)
                })
                for(let i = 0 ; i<images.length ; i++) {
                    await Products.findOneAndUpdate({_id : productId} , {$push : {images : images[i]}})
                }
                const categoryData = await Categories.find({})
                const imageData = await Products.findOne({_id : productId})
                res.json({ success: true, categoryData, imageData });
            }else{
                res.json({success : true , length : 'Maximum limit for images is Four...'})
            }
            
    }catch(error){
        next(error)
        console.log(error.message);
    }
}





module.exports = {
    insertProduct,
    deleteProduct,
    viewProducts,
    viewEditProduct,
    deleteProductImages,
    updateProduct,
    updateProductImage
}