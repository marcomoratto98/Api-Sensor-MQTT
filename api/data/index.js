const sql = require("mssql");
const config= {
    user: '/*user*/',
    password: '/*password*/',
    server: 'localhost\\sqlexpress',
    database: 'ITS-IOT',
    options: {
        encrypt: false
    }
};

async function routes (fastify, options) {
    fastify.post('/', async (request, reply) => {
        var data=request.body;
            try{
                console.log("                           POST                           ");
                let pool = await sql.connect(config);
                let result =await pool
                .query(`INSERT INTO JsonTEST 
                ([Numpeople],[Dataora]) 
                VALUES ('${data.people}','${data.date}');`);
                sql.close();
                reply.code(200).send();
            }
            catch(error){
                reply.code(500).send(error);
                console.log("                              ERRORE:                                                                  "+error);
            }
            finally{
                sql.close();
            } 
    });
}
module.exports=routes;
