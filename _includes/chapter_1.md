### 1. Préparation de votre environnement
Pour réaliser les différentes étapes de ce hands-on, vous avez besoin d'un ElasticSearch et des dev tools (inclus dans kibana 5)  
 Plusieurs choix s'offrent à vous :  
* __Choix numéro 1 : Vous avez Docker sur votre machine, utiliser Elasticsearch via Docker :__  
  Pour gagner du temps sur le téléchargement de l'image vous pouvez récupérer l'image docker sur la clef dans *docker/* et la charger avec la commande suivante :  
  `docker load < elasticsearch-kibana.tar`   
  Pour lancer les applications :  
`docker run -p 9200:9200 -p 5601:5601 ibeauvais/elasticsearch-kibana:5.2`  

Vous pouvez ensuite accéder à ElasticSearch sur [http://localhost:9200/](http://localhost:9200/) et
les dev tools sur [http://localhost:5601/app/kibana#/dev_tools/console?_g=()](http://localhost:5601/app/kibana#/dev_tools/console?_g=())  
(si vous utilisez docker sur une vm ou via docker-machine remplacer localhost par l'ip de la vm)
    
* __Choix numéro 2 :  Utiliser un ElasticSearch et Kibana local (fourni via la cle USB):__
    - Si vous n'avez pas Java 8, installer la version sur la clef correspondant à votre système  
    - Copier ElasticSearch et Kibana 5.2.2 dans un répertoire 
    - Dézipper ElasticSearch et Kibana, vous devez avoir 2 répertoires ElasticSearch et Kibana
    - Démarrer ElasticSearch avec la commande __{elasticsearch_directory}/bin/elasticsearch__ ou __{elasticsearch_directory}/bin/elasticsearch.bat__ (windows)
    - Démarrer Kibana avec la commande __{kibana_directory}/bin/kibana__ ou __{kibana_directory}/bin/kibana.bat__ (windows)
Vous pouvez ensuite accéder à ElasticSearch sur [http://localhost:9200/](http://localhost:9200/) et
les dev tools sur [http://localhost:5601/app/kibana#/dev_tools/console?_g=()](http://localhost:5601/app/kibana#/dev_tools/console?_g=())       
    
 ---