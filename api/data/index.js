const Influx=require('influx');
const influx = new Influx.InfluxDB({
    host: 'localhost',
    database: 'autobus',
    schema: [
      {
        measurement: 'position',
        fields: { lat: Influx.FieldType.STRING,
            lon: Influx.FieldType.STRING,
            npersone: Influx.FieldType.INTEGER,
            porte: Influx.FieldType.BOOLEAN },
        tags: ['linea', 'nautobus']
      }
    ]
  });


async function routes (fastify, options) {
    fastify.post('/', async (request, reply) => {
        var data=request.body;
        //console.log(JSON.stringify(data));
        var datess=Date.parse(data.date)* 1000000;
        

        influx.getDatabaseNames()
        .then(names => {
          if (!names.includes('autobus')) {
            return influx.createDatabase('autobus');
          }
        })
        .then(() => {
        
          influx.writePoints([
              {
                measurement: 'position',
                tags: {
                  linea: data.linea,
                  nautobus: data.nautobus,
                },
                fields: { lat: data.distance[0],
                  lon: data.distance[1],
                  npersone: data.people,
                  porte: data.porte },
                timestamp: datess,
              }
            ], {
              database: 'autobus'
            }).then(function(){
              reply.code(200).send();
              console.log("Query avvenuta con successo-----------------------------------------------");
            })
            .catch(error => {
              //console.error(`Error saving data to InfluxDB! ${err.stack}`)
              console.log("                              ERRORE:                                                                  "+error);
              reply.code(500).send(error);
              
          });
        })
        .catch(error => console.log({ error }));
    });
}
module.exports=routes;
