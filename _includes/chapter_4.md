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
             "type": "keyword"
           },
           "postalCode": {
             "type": "keyword"
           },
           "street": {
             "type": "text"
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
           "distance": "300m",
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
          "distance": "300m",
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

---