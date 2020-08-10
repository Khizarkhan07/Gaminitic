const moongose = require ("mongoose");

const Availability = new moongose.Schema({
    user_id : {
        type: moongose.Schema.ObjectId,
        ref: "user"
    },
    monday :
         [
            {
                type: Date
            }
        ]
    ,
    tuesday : [
            {
                type: Date
            }
        ],
    wednesday:[
            {
                type: Date
            }
        ],

    thursday:[
        {
            type: Date
        }
    ],
    friday:[
        {
            type: Date
        }
    ],
    saturday:[
        {
            type: Date
        }
    ],
    sunday:[
        {
            type: Date
        }
    ],

});
module.exports= moongose.model("availability", Availability);