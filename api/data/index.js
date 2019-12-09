const fs = require('fs');
const Influx = require('influx');

async function routes (fastify, options) {

  fastify.get('/', async (request, reply) => {
    try{

      influx.query(`
      select * from tide
      where location =~ /(?i)(${place})/
    `)
    .then( result => response.status(200).json(result) )
    .catch( error => response.status(500).json({ error }) );

      
    }
    catch(error){
        reply.code(500).send(error);
    }
    finally{
        sql.close();
    }
  });

  fastify.post('/', async (request, reply) => {

    fs.readFile('config.txt', (err, obj) => { 
      if (err) 
        throw err; 
      var datas = obj.toString(); 
      var data = datas.split(",");
      var db = [];
      for (let i = 0; i < data.length; i++) {
        var s = data[i].split("\'");
        db[i] = s[1];
      }
      createSchema(db);
    })

    createSchema = (db) => {
      var schema = {
        host: db[0],
        database: db[1],
        username: db[2],
        password: db[3],
        schema: [{
          measurement: 'position',
          fields: { 
            lat: Influx.FieldType.FLOAT,
            lon: Influx.FieldType.FLOAT,
            npersone: Influx.FieldType.INTEGER,
            porte: Influx.FieldType.BOOLEAN 
          },
          tags: ['linea', 'nautobus']
        }]
      }
    
      const influx = new Influx.InfluxDB(schema);

      var data=request.body;
      var datess=Date.parse(data.date)* 1000000;
      
      influx.getDatabaseNames().then(names => {
        if (!names.includes(db[1])) {
          return influx.createDatabase(db[1]);
        }
      }).then(() => {
        influx.writePoints([{
          measurement: 'position',
          tags: {
            linea: data.linea,
            nautobus: data.nautobus,
          },
          fields: { 
            lat: data.distance[0],
            lon: data.distance[1],
            npersone: data.people,
            porte: data.porte 
          },
          timestamp: datess,
        }], {
          database: db[1]
        }).then(function(){
          reply.code(200).send();
          console.log("Dati inseriti");
        }).catch(error => {
          console.log("Errore: "+error);
          reply.code(500).send(error);
        });
      }).catch(error => console.log({ error }));
    }
  });
}
module.exports=routes;
