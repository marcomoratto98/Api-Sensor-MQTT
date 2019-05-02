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
        var distanza1=data.distance[0];
        var distanza2=data.distance[1];
        try{
            console.log("                           POST                           ");
            let pool = await sql.connect(config);
            let result =await pool
            .query(`INSERT INTO JsonTEST 
            ([Latitude],[Longitude],[Dataora]) 
            VALUES ('${distanza1}','${distanza2}','${data.date}');`);
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
