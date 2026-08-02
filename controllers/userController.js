const db = require("../config/db");

exports.home = (req,res)=>{

const sql=`
SELECT news.*,categories.category_name
FROM news
JOIN categories
ON news.category_id=categories.id
ORDER BY news.created_at DESC
`;

db.query(sql,(err,results)=>{

if(err)
return res.send(err);

res.render("user/index",{
news:results
});

});

};