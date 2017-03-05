### 1. Préparation de votre environnement
Pour réaliser les différentes étapes de ce hands-on, vous avez besoin d'un ElasticSearch et des dev tools (inclus dans kibana 5)  
 Plusieurs choix s'offrent à vous :  
* __Choix numéro 1 : Vous avez docker sur votre machine, utiliser Elasticsearch via Docker :__  
`docker run -p 9200:9200 -p 5601:5601 ibeauvais/elasticsearch-kibana:5.2`  

Vous pouvez ensuite accéder à Elasticsearch sur [http://localhost:9200/](http://localhost:9200/) et
les dev tools sur [http://localhost:5601/app/kibana#/dev_tools/console?_g=()](http://localhost:5601/app/kibana#/dev_tools/console?_g=())  
(si vous utilisez docker sur une vm ou via docker-machine remplacer localhost par l'ip de la vm)
    
* __Choix numéro 2 : Vous avez Java sur votre machine (minimum 1.7), utiliser un Elasticsearch local (fourni via la cle USB):__  
    - dézipper elasticsearch-2.4.1.zip  
    - Démarrer le avec la commande __elasticsearch-2.4.1/bin/elasticsearch__ ou __elasticsearch-2.4.1/bin/elasticsearch.bat__ (windows)   
Vous pouvez ensuite accéder à Elasticsearch sur [http://localhost:9200/](http://localhost:9200/) et
sense sur la version en ligne sur [http://kibana.xebicon.aws.xebiatechevent.info:5601/app/sense](http://kibana.xebicon.aws.xebiatechevent.info:5601/app/sense) __=> vous devez modifier le champ "Server" en localhost:9200__       
    



* __Choix numéro 3 : Utiliser l'Elasticsearch mis à votre disposition (partagé par tout le monde)__  

Vous pouvez ensuite accéder à Elasticsearch sur [http://els.xebicon.aws.xebiatechevent.info/](http://els.xebicon.aws.xebiatechevent.info/) et sense sur [http://kibana.xebicon.aws.xebiatechevent.info:5601/app/sense](http://kibana.xebicon.aws.xebiatechevent.info:5601/app/sense)  
Comme cet Elasticsearch est utilisé par plusieurs personnes, veuillez préfixer le nom de vos index par
votre nom lors des différentes requêtes de l'exercice.   
  
Exemple : Au lieu de faire GET http://els.xebicon.aws.xebiatechevent.info/__myIndex__/_search, je fais GET
            http://els.xebicon.aws.xebiatechevent.info/__beauvais-myIndex__/_search  
  
 ---