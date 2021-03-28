const Comments = require('../models/commentModel')


class APIfeatures{
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }
    sorting(){
        this.query = this.query.sort('-createdAt')
        return this;
    }
}

const commentCtrl = {
    getComments: async (req, res) => {
        try {
            const features = new APIfeatures(Comments.find({product_id: req.params.id}), req.query).sorting()

            const comments = await features.query
            
            res.json({
                status: "success",
                result: comments.length,
                comments
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }
}

module.exports = commentCtrl