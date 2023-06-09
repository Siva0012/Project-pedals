const Banners = require('../models/banner_model')
const Admin = require('../models/admin_model')


/*-----------------view banner add page----------*/
const viewBanner = async (req , res , next) =>{

    try{
        const adminData = await Admin.findOne({})
        const bannerData = await Banners.find({})
        res.render('view_banner' , {bannerData : bannerData , adminData : adminData})
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*-----------------add new banner page-----------*/
const showAddBanner = async (req , res , next) =>{

    try{
        const adminData = await Admin.findOne({})
        res.render('add_banner' , {adminData : adminData})
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*------------------insert new banner-------------*/
const insertBanner = async (req , res , next) =>{

    try{
        const image = req.file.filename
        const banData = new Banners(
            {
                title : req.body.title,
                subTitle : req.body.subTitle,
                image : image
            }
        )

        const bannerData = await banData.save()
        res.redirect('/admin/viewBanner')
    }catch(error){
        next(error)
        console.log(error.message);
    }
}

/*-----------------delete banner-----------------*/
const deleteBanner = async (req , res , next) =>{

    try{
        const bannerId = req.params.id
        const deleteResponse = await Banners.findOneAndDelete({_id : bannerId})
        res.redirect('/admin/viewBanner')
    }catch(error){
        next(error)
        console.log(error.message);
    }
}


module.exports = {
    viewBanner,
    showAddBanner,
    insertBanner,
    deleteBanner
}