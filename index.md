---
css: stylesheets/stylesheet.css
js: javascripts/main.js
layout: main
---

### 1. Préparation de votre environnement
Pour réaliser les différentes étapes de ce hands-on, vous avez besoin d'un ElasticSearch et d'un sense  
 Plusieurs choix s'offrent à vous :  
* __Choix numéro 1 : Vous avez docker sur votre machine, utiliser Elasticsearch via Docker :__  
`docker run -p 9200:9200 -p 5601:5601 ibeauvais/elasticsearch-kibana`  

Vous pouvez ensuite accéder à Elasticsearch sur [http://localhost:9200/](http://localhost:9200/) et
sense sur [http://localhost:5601/app/sense](http://localhost:5601/app/sense)  
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
 
### 2. Découverte de l'api

###### Attention, pour cette partie, si vous utilisez le Elasticsearch en ligne n'oubliez pas de changer le nom d'index __'programmer'__ en __'votre-nom-programmer'__ ######   

   __2.1 Premier document indexé :__    
Requête __POST__ programmer/person/1
{% highlight json %}
{
    "name": "Lovelace",
    "firstname": "Ada",
    "birthday" : "1815-12-10"
}
{% endhighlight %}   
  
---  
   
- **programmer** est le nom de l'index
- **person** est le type de document
- **1** est l'id   
   
  __2.2 Retrouver le document par son id :__  
Requête __GET__ programmer/person/1  
    
  __2.3 Indexer d'autres documents (Avec les id 2 et 3):__  
{% highlight json %}
{
    "name": "Gosling",
    "firstname": "James",
    "birthday" : "1954-05-19"
}
{% endhighlight %}  
--- 
{% highlight json %}
{
    "name": "Berners-Lee",
    "firstname": "Tim",
    "birthday" : "1955-06-08"
}
{% endhighlight %}
---
  __2.4 Recherche sans critère :__  
__GET__ programmer/person/_search

  __2.5 Recherche full text :__  
__GET__ programmer/person/_search
{% highlight json %}
{
    "query": {
        "match": {
            "name": "lee"
        }
    }
}
{% endhighlight %}
---
  __2.6 Recherche full text avec highlighting (mise en surbrillance du terme qui "match" le texte de recherche) :__  
__GET__ programmer/person/_search
{% highlight json %}
{
    "query": {
        "match": {
            "name": "lee"
        }
    },
    "highlight": {
        "fields": {
            "name":{}
        }
    }
}
{% endhighlight %}
---    
  __2.7 Voir le mapping :__  
__GET__ programmer/person/_mapping
  
  __2.8 Supprimer un document :__  
__DELETE__ programmer/person/{id}
      
  __2.9 Supprimer l'index :__  
__DELETE__ programmer

---

### 3. Recherche d'article de blog
Vous disposez un jeu de données à indexer dans Elasticsearch contenant les articles du blog de Xebia. Vous allez
devoir réaliser plusieurs étapes afin d'implémenter la recherche de ces articles. Un document représente un
article avec les champs suivants : 

* __title__ : Le titre de l'article
* __pubDate__ : La date de publication de l'article
* __creator__ : L'auteur de l'article
* __category__ : L'article appartient à une ou plusieurs catégories
* __description__ : Description courte de l'article
* __content__ : Contenu complet de l'article au format html
  
---

###### Attention, pour cet partie, si vous utilisez le Elasticsearch en ligne n’oubliez pas de changer le nom d’index __‘xebia’__ en __‘votre-nom-xebia’__ ######

  __3.1 Création de l'index__  
Créer l'index pour recevoir les documents avec le mapping ci-dessous. Ce mapping est équivalent au mapping par défaut généré par Elasticsearch mais sera plus facilement modifiable par la suite (Déclaration d'un premier analyzer).
 Pour créer l'index 'xebia' avec ce mapping :  
    
__PUT__ xebia
{% highlight json %}
{
    "mappings": {
        "blog": {
            "properties": {
                "category": {
                    "type": "string"
                },
                "content": {
                    "type": "string"
                },
                "creator": {
                    "type": "string"
                },
                "description": {
                    "type": "string"
                },
                "pubDate": {
                    "type": "date",
                    "format": "strict_date_optional_time||epoch_millis"
                },
                "title": {
                    "type": "string"
                }
            }
        }
    },
    "settings": {
        "analysis": {
            "analyzer": {
                "my_analyzer": {
                    "type": "custom",
                    "tokenizer": "standard",
                    "filter": [
                        "lowercase"
                    ],
                    "char_filter": [
                    ]
                }
            },
             "filter": {},
             "tokenizer": {},
             "char_filter": {}
        }
    }
}
{% endhighlight %}
---
  __3.2 Indexer les documents__  
Pour indexer tous ces documents en une étape vous allez utiliser curl :  

 * Télécharger le dataset [xebiablog.data](data/xebiablog.data)
 * Exécuter une requête bulk indexing :  
  `curl -XPUT http://{host}/{indexName}/blog/_bulk --data-binary @xebiablog.data`
  
  __Vérifier que les 23 documents sont correctements indexés :__  
  __GET__ xebia/blog/_count  
  
Le fichier __xebiablog.data__ contient l'ensemble des documents à indexer au format :   
{"index" : {"_id":"2"}}  
{"title":"Scrum pour la Recherche","pubDate":"2016-09-19T13:39:42"  ...}        
[...]  

  __3.3 En vous inspirant de l'exercice 2.5, écrire une requête qui permet de remonter les articles dont <u>le contenu</u> parle de "kodo kojo"__
<blockquote class = 'solution' markdown="1">
__GET__ xebia/blog/_search
{% highlight json %}
{
    "query": {
        "match": {
            "content": "kodo kojo"
        }
    }
}
{% endhighlight %}
</blockquote>
---
  __3.4 La requête précédente permet de rechercher sur le contenu des articles. Cependant en effectuant cette requête sur le texte "Recherche full Text", les résultats ne semblent pas remonter de contenu pertinent : En effet, les 2 premiers résultats remontés n'ont pas de rapport avec ces termes.
Utiliser l'highlighting afin de comprendre pourquoi ces résultats sont remontés.__
<blockquote class = 'solution' markdown="1">
GET xebia/blog/_search
{% highlight json %}
{
    "query": {
        "match": {
            "content": "Recherche full Text"
        }
    },
    "highlight": {
        "fields": {
            "content":{}
        }
    }
}{% endhighlight %}
Conclusion : Les caractères html font "matcher" les termes "full" et "text" à tord.
</blockquote>
---
  __3.5 Pour résoudre le problème précédent, changer l'analyzer du champ 'content' afin de supprimer les caractères html :__  
Pour cela modifier le mapping afin d'utiliser le char filter __html_strip__ dans le 'custom analyzer' __my_analyzer__ et déclarer le champ __'content'__ comme utilisant cet analyzer.  
__Syntaxe du mapping avec analyzer :__ 
{% highlight json %}
{
    "{fieldName}": {
          "type": "string",
          "analyzer": "{analyzerName}"
     }
}
{% endhighlight %}

---

  * pour modifier le mapping vous devez : 
    * Supprimer l'index
    * Re-créér l'index avec le nouveau mapping    
    * Re-indexer tous les documents (avec le cUrl) 


Relancer la requête sur le texte "Recherche full Text" afin de vérifier qu'il y a moins de résultats mais qu'ils sont plus pertinents !

<blockquote class = 'solution' markdown="1">
__DELETE__ xebia  
__PUT__ xebia
{% highlight json %}
{
  "mappings": {
    "blog": {
      "properties": {
        "category": {
          "type": "string"
        },
        "content": {
          "type": "string",
          "analyzer": "my_analyzer"
        },
        "creator": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "pubDate": {
          "type": "date",
          "format": "strict_date_optional_time||epoch_millis"
        },
        "title": {
          "type": "string"
        }
      }
    }
  },
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase"
          ],
          "char_filter": [
            " html_strip"
          ]
        }
      },
        "filter": {},
        "tokenizer": {},
        "char_filter": {}
    }
  }
}
{% endhighlight %}
__curl -XPUT "http://{host}/{indexName}/blog/_bulk" --data-binary @xebiablog.data__
</blockquote>
---  
   
  __3.6 L'entreprise Typesafe a changé de nom pour Lightbend. Problème, les recherches sur "lightbend" ne remontent que 2 résultats. Modifier le mapping afin que toutes les recherches sur un des noms remontent les 8 résultats associés aux 2 noms d'entreprise.__   
  Pour cela declarez un _filter_ de type synonym dans la partie `"filter": {},`du mapping et utilisez le dans l'analyzer my_analyzer 

__Syntaxe :__   
{% highlight json %}
{
    "{filterName}": {
          "type": "synonym",
          "synonyms": [
            "term1, term2 => synonym1, synonym2"
          ]
     }
}        
{% endhighlight %}

---


<blockquote class = 'solution' markdown="1">
__DELETE__ xebia  
__PUT__ xebia
{% highlight json %}
{
  "mappings": {
    "blog": {
      "properties": {
        "category": {
          "type": "string"
        },
        "content": {
          "type": "string",
          "analyzer": "my_analyzer"
        },
        "creator": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "pubDate": {
          "type": "date",
          "format": "strict_date_optional_time||epoch_millis"
        },
        "title": {
          "type": "string"
        }
      }
    }
  },
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "mySynonym"
          ],
          "char_filter": [
            " html_strip"
          ]
        }
      },
      "filter": {
        "mySynonym": {
          "type": "synonym",
          "synonyms": [
            "lightbend, typesafe => lightbend, typesafe"
          ]
        }
      },
      "tokenizer": {},
      "char_filter": {}
    }
  }
}
{% endhighlight %}
__curl -XPUT "http://{host}/{indexName}/blog/_bulk" --data-binary @xebiablog.data__
</blockquote>
---

  __3.7 Filtrage des posts trop anciens :__   
  Les recherches peuvent remonter des résultats de 2011. En recherchant "sponsor", on remonte un blog post intitulé __"Xebia sponsor platinium de Devoxx France !"__ trop ancien.  
  Utilisez la recherche full text conjointement avec un filtre pour ne pas remonter les documents plus anciens de 4 ans.
  La recherche sur "sponsor" doit remonter uniquement un blog post __"Xebia sponsor Gold de Scala.io 2013"__.  
Pour cela utilisez une **bool** query  et un **range** filter  
__Syntaxe :__   
{% highlight json %}
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "{field_name}": "{search_value}"
          }
        }
      ],
      "filter": {
        "range": {
          "{field_name}": {
            "gte": "{date_min}",
            "lte": "{date_max}"
          }
        }
      }
    }
  }
}       
{% endhighlight %}

---


<blockquote class = 'solution' markdown="1">
GET xebia/blog/_search
{% highlight json %}
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "content": "sponsor"
          }
        }
      ],
      "filter": {
        "range": {
          "pubDate": {
            "gte": "now-4y"
          }
        }
      }
    }
  }
} 
{% endhighlight %}
_
</blockquote>
---

  __3.8 Requête sur plusieurs champs :__   
  En gardant la requête précédente mais sur le texte "javascript", les résultats ne sont pas assez ciblés sur le sujet. En effet, on remonte un blog très général de la revue de presse au lieu d'articles dédiés au javascript.  
  Afin de rendre le résultat plus pertinent modifier la requête précédente pour remplacer la requête de type **match** par une requête de type **multi_match** 
  afin de pouvoir exécuter la même requête conjointement sur le champ "content" et le champ "title".    
  

---


<blockquote class = 'solution' markdown="1">
GET xebia/blog/_search
{% highlight json %}
{
  "query": {
    "bool": {
      "must": [
        {
          "multi_match": {
            "query": "javascript",
            "fields": ["content","title"]
          }
        }
      ],
      "filter": {
        "range": {
          "pubDate": {
            "gte": "now-2y"
          }
        }
      }
    }
  }
}
{% endhighlight %}
_
</blockquote>
---
__3.9 Suggestion :__   
  Nous souhaitons être capable de faire de la suggestion sur le titre des posts dès la première lettre saisie. Pour cela, vous allez utiliser l'api __Completion suggester :__    
  
  -  Ajoutez un champ "suggest" au mapping, de type __completion__ et avec comme propriété __"payloads": true__.   
  Ce champ va contenir le texte pour la suggestion mais sera indexé dans une structure optimisée pour faire de la recherche rapide sur du texte.  
  - Utilisez le fichier [xebiablogWithSuggest.data](data/xebiablogWithSuggest.data) pour l'indexation. Ce fichier contient les mêmes documents mais avec le champ suggest au format suivant :   
{% highlight json %}
  {
    "suggest": {
            "input": ["suggest_text>"],
            "payload": {
                 "blogId": "<documentId>"
            }
    }
  }
{% endhighlight %}
---  
  - Effectuer une requête de type suggest   
__Syntaxe :__
GET xebia/_suggest
{% highlight json %}      
{
  "<name>":{
    "text" : "<text_to_search>",
        "completion" : {
            "field" : "<suggest_field_name>"
    }
  }
}  
{% endhighlight %}

Cette requête doit pouvoir remonter les titres de recherche sur d, do, doc, dock, docke, docker. Ainsi que l'id du document correspondant. 

---


<blockquote class = 'solution' markdown="1">
DELETE xebia         
PUT xebia  
{% highlight json %}   
{
  "mappings": {
    "blog": {
      "properties": {
        "category": {
          "type": "string"
        },
        "content": {
          "type": "string",
          "analyzer": "my_analyzer"
        },
        "creator": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "pubDate": {
          "type": "date",
          "format": "strict_date_optional_time||epoch_millis"
        },
        "title": {
          "type": "string"
        },
        "suggest": {
          "type": "completion",
          "payloads": true
        }
      }
    }
  },
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "mySynonym"
          ],
          "char_filter": [
            " html_strip"
          ]
        }
      },
      "filter": {
        "mySynonym": {
          "type": "synonym",
          "synonyms": [
            "lightbend, typesafe => lightbend, typesafe"
          ]
        }
      },
      "tokenizer": {},
      "char_filter": {}
    }
  }
}
 {% endhighlight %}
curl -XPUT "localhost/xebia/blog/_bulk" --data-binary @xebiablogWithSuggest.data

GET xebia/_suggest
{% highlight json %}   
{
  "title-suggest":{
    "text" : "do",
        "completion" : {
            "field" : "suggest"
        }
  }
}
{% endhighlight %}
</blockquote>
---
__3.10 Suggestion fuzzy:__   
  Problème l'api de suggestion ne remonte pas de résultat si la personne qui effectue la recherche se trompe dans la saisie du texte.   
   Modifiez la requête de suggestion afin de pouvoir remonter les suggestions liées à Docker si l'on saisie "Doker".  
   Pour cela, ajoutez le paramètre `"fuzzy":{}` à la requête.
<blockquote class = 'solution' markdown="1">
{% highlight json %}   
{
  "title-suggest":{
    "text" : "doker",
        "completion" : {
            "field" : "suggest",
            "fuzzy" : { }
        }
  }
}
{% endhighlight %}
</blockquote>
---
__3.11 Agrégations par categories:__   
  Nous souhaitons maintenant ramener toutes les catégories possibles pour un blog.  
  Pour cela utilisez une aggrégations de type __terms__.

  __Syntaxe :__  
  GET xebia/blog/_search
  {% highlight json %}      
  { "size": 0, 
    "aggregations": {
      "<aggregation_name>": {
        "<aggregation_type>": {
          "field": "<field_name>"
        }
      }
    }
  }
{% endhighlight %}  
            
---     

__Attention__ : On doit remonter le texte contenu dans le champ __category__ sans analyse, pour cela vous allez devoir modifier le mapping pour ajouter l'option suivante au type __string__ :   
   `"index": "not_analyzed"`  
L'attribut __size__ est à 0 car on ne tient pas ici à remonter les documents mais  uniquement le résultat de l'aggrégation
  
<blockquote class = 'solution' markdown="1">
DELETE xebia     
PUT xebia     
{% highlight json %}   
{
  "mappings": {
    "blog": {
      "properties": {
        "category": {
          "type": "string",
          "index": "not_analyzed"
        },
        "content": {
          "type": "string",
          "analyzer": "my_analyzer"
        },
        "creator": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "pubDate": {
          "type": "date",
          "format": "strict_date_optional_time||epoch_millis"
        },
        "title": {
          "type": "string"
        },
        "suggest": {
          "type": "completion",
          "payloads": true
        }
      }
    }
  },
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "mySynonym"
          ],
          "char_filter": [
            " html_strip"
          ]
        }
      },
      "filter": {
        "mySynonym": {
          "type": "synonym",
          "synonyms": [
            "lightbend, typesafe => lightbend, typesafe"
          ]
        }
      },
      "tokenizer": {},
      "char_filter": {}
    }
  }
}
{% endhighlight %}
GET xebia/blog/_search
{% highlight json %}   
{ "size": 0, 
  "aggregations": {
    "by_category": {
      "terms": {
        "field": "category",
        "size": 100
      }
    }
  }
}
{% endhighlight %}
</blockquote>
---   
__3.12 Agrégations auteurs par catégories:__   
Nous voulons maintenant remonter les différents auteurs par catégories. Modifier la requête précédente pour ajouter une sous agrégations à l'agrégation par catégories:   

  __Syntaxe pour ajouter une sous-agrégation:__  
  GET xebia/blog/_search
  {% highlight json %}      
{
  "size": 0,
  "aggregations" : {
    "<parent_aggregation_name>" :{
      "<parent_aggregation_type>": {
        "field": "<field_name>"
      },
      "aggregations" :{
        "<child_aggregation_name>" : {
          "child_aggregation_type>": {
            "field": "<field_name>"
          }
        }
      }
    }
  }
}
{% endhighlight %}  
            
---     

__Attention__ : Même problème que l'aggrégation précédente : une aggrégation doit se faire sur un contenu __exact__ et donc pas sur un texte analysé.
  
<blockquote class = 'solution' markdown="1">
DELETE xebia     
PUT xebia     
{% highlight json %}   
{
  "mappings": {
    "blog": {
      "properties": {
        "category": {
          "type": "string",
          "index": "not_analyzed"
        },
        "content": {
          "type": "string",
          "analyzer": "my_analyzer"
        },
        "creator": {
          "type": "string",
          "index": "not_analyzed"
        },
        "description": {
          "type": "string"
        },
        "pubDate": {
          "type": "date",
          "format": "strict_date_optional_time||epoch_millis"
        },
        "title": {
          "type": "string"
        },
        "suggest": {
          "type": "completion",
          "payloads": true
        }
      }
    }
  },
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "mySynonym"
          ],
          "char_filter": [
            " html_strip"
          ]
        }
      },
      "filter": {
        "mySynonym": {
          "type": "synonym",
          "synonyms": [
            "lightbend, typesafe => lightbend, typesafe"
          ]
        }
      },
      "tokenizer": {},
      "char_filter": {}
    }
  }
}
{% endhighlight %}
GET xebia/blog/_search
{% highlight json %}   
{
  "size": 0,
  "aggregations" : {
    "by_categories" :{
      "terms": {
        "field": "category",
        "size": 10
      },
      "aggregations" :{
        "by_creator" : {
          "terms": {
            "field": "creator",
            "size": 10
          }
        }
      }
    }
  }
}
{% endhighlight %}
</blockquote>
---   
---

### 4. Recherche appartement

L'agence X-immobilier vient de créer son site internet de recherche de biens immobiliers sur Paris.
Vous disposez d'un jeu de données à indexer dans Elasticsearch contenant des appartements à vendre 
avec les champs suivants : 

* __price__ : Le prix en euro
* __nbOfRoom__ : Nombre de pièce
* __surface__ : La surface en m²
* __address__ : un 'object' contenant l'adresse :  
    * __street__ : le numéro et la voie
    * __postalCode__ : le code postal
    * __city__ : La ville
* __location__ : un object contenant les coordonnées de géolocalisation
    * __lat__ : la latitude
    * __lon__ : la longitude    
    
Voici un exemple : 
{% highlight json %}   
{
    "price": 136920,
    "nbOfRoom": 4,
    "surface": 56,
    "address": {
        "street": "21 BOULEVARD DE LA MALIBRAN",
        "postalCode": "77680",
        "city": "ROISSY EN BRIE"
    },
    "location": {
        "lat": 48.794399999999996,
        "lon": 2.64448
    }
}{% endhighlight %}
---
__4.1 Création de l'index__  
Créer l'index pour recevoir les documents avec le mapping ci-dessous.
Le mapping n'aura plus besoin d'être modifié. Noter le mapping du champ location.

###### Attention,  pour cette partie, si vous utilisez le Elasticsearch en ligne n'oubliez pas de changer le nom d'index __'x-immobilier'__ en __'votre-nom-x-immobilier'__ ######     
     
__PUT__ x-immobilier
{% highlight json %}
{
 "mappings": {
   "apartment": {
     "properties": {
       "address": {
         "properties": {
           "city": {
             "type": "string"
           },
           "postalCode": {
             "type": "string"
           },
           "street": {
             "type": "string"
           }
         }
       },
       "location": {
          "type": "geo_point"
       },
       "nbOfRoom": {
         "type": "long"
       },
       "price": {
         "type": "long"
       },
       "surface": {
         "type": "long"
       }
     }
   }
 }
}
{% endhighlight %}
---
  __4.2 Indexer les documents__  
Pour indexer tous ces documents en une étape vous allez utiliser curl :  

 * Télécharger le dataset [apartment.data](data/apartment.data)
 * Exécuter une requête bulk indexing :  
  `curl -XPUT http://{host}/{index_name}/apartment/_bulk --data-binary @apartment.data`
  
 __Vérifier que les 987 documents sont correctements indexés :__  
 __GET__ x-immobilier/_count
   
---                                     
__4.3 Bounding box query__    

Pour les besoins du site, il faut être capable de rechercher les appartements se trouvant dans le __9e arrondissement__.  
Le 9e arrondissement pour cette requête est représenté par un rectangle avec les caractéristiques suivantes :   
 - Extrémité en haut à gauche à la position __"lat": 48.88202934722508, "lon": 2.3397765430833624__  
 - Extrémité en bas à droite à la position __"lat": 48.870738  "lon": 2.347842__      
    
Ecrire une requête avec un __filtre__  __geo_bounding_box__ sur ce rectangle pour remonter les 21 appartements dans le 9e.
<blockquote class = 'solution' markdown="1">

GET x-immobilier/apartment/_search
{% highlight json %}   
{
  "query": {
    "bool": {
      "filter": [
        {
          "geo_bounding_box": {
            "location": {
              "top_left": {
                "lat": 48.88202934722508,
                "lon": 2.3397765430833624
              },
              "bottom_right": {
                "lat": 48.870738,
                "lon": 2.347842
              }
            }
          }
        }
      ]
    }
  }
}
{% endhighlight %}
</blockquote>
---
__4.4 Filtre par rapport à la distance depuis un point__  
Finalement le 9e arrondissement n'est pas assez restrictif, il faut être capable de rechercher les appartements à 300m ou moins du métro cadet __lat: 48.876135__, __"lon": 2.344876__.   
Remplacer le __geo_bounding_box__ filter de la requête précédente par un filtre de type __geo_distance__  afin de remonter les 10 appartements à 300m ou moins.   
 

<blockquote class = 'solution' markdown="1">

GET x-immobilier/apartment/_search
{% highlight json %}   
{
  "query": {
    "bool": {
      "filter": 
        {
         "geo_distance": {
           "distance": 300,
           "distance_unit": "m",
           "location": {
             "lat": 48.876135,
             "lon": 2.344876
           }
         }
        }
      
    }
  }
}
{% endhighlight %}
</blockquote>
---
__4.5 Tri par rapport à la distance depuis un point__  
La requête précédente permet aux utilisateurs de remonter les résultats attendus, cependant les utilisateurs souhaiteraient voir en priorité les appartements les plus proches.  
Modifier la requête pour ajouter le tri par ___geo_distance__  
Vous devez avoir en premier l'appartement se trouvant __46 RUE DE TREVISE__

<blockquote class = 'solution' markdown="1">

GET x-immobilier/apartment/_search
{% highlight json %}   
{
  "query": {
    "bool": {
      "filter": {
        "geo_distance": {
          "distance": 300,
          "distance_unit": "m",
          "location": {
            "lat": 48.876135,
            "lon": 2.344876
          }
        }
      }
    }
  },
  "sort": [
    {
      "_geo_distance": {
        "location": {
          "lat": 48.876135,
          "lon": 2.344876
        },
        "order": "asc"
      }
    }
  ]
}
{% endhighlight %}
</blockquote>
---
__4.6 Geo_distance aggrégation__  
Afin d'évaluer la quantité de bien se trouvant à proximité du métro cadet, nous aimerions avoir le compte pour les plages de distance suivantes :      
- 0 à 100m  
- 100 à 200m  
- 200 à 300m  
- 300 à 400m  
- 400 à 500m  
- 500 à 1000m  
    
Pour cela vous devez écrire une requête d'aggrégation de type geo_distance.  
__Pour vous aider inspirer vous des précédentes requêtes d'agrégations et de l'auto complétion.__     
<blockquote class = 'solution' markdown="1">

GET x-immobilier/apartment/_search
{% highlight json %}   
{
  "size": 0,
  "aggs": {
    "by_geo": {
      "geo_distance": {
        "field": "location",
        "origin": {
          "lat": 48.876135,
          "lon": 2.344876
        },
        "unit": "m",
        "ranges": [
          {
            "to": 100
          },
          {
            "from": 200,
            "to": 300
          },
          {
            "from": 300,
            "to": 400
          },
          {
            "from": 400,
            "to": 500
          },
          {
            "from": 500,
            "to": 1000
          }
        ]
      }
    }
  }
}
{% endhighlight %}
</blockquote>
