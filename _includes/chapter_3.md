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
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "content": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "creator": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "description": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "pubDate": {
          "type": "date"
        },
        "title": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
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
          "char_filter": []
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
  `curl -XPUT http://{host:port}/xebia/blog/_bulk --data-binary @xebiablog.data`
  
  __Vérifier que les 23 documents sont correctements indexés :__  
  __GET__ xebia/blog/_count  
  
Le fichier __xebiablog.data__ contient l'ensemble des documents à indexer au format :   
{"index" : {"_id":"2"}}  
{"title":"Scrum pour la Recherche","pubDate":"2016-09-19T13:39:42"  ...}        
[...]  

  __3.3 En vous inspirant de l'exercice [2.5](#2.5), écrire une requête qui permet de remonter les articles dont <u>le contenu</u> parle de "kodo kojo"__
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
Pour cela modifier le mapping afin d'utiliser le char_filter __html_strip__ dans le 'custom analyzer' __my_analyzer__ et déclarer le champ __'content'__ comme utilisant cet analyzer.  
__Syntaxe du mapping avec analyzer :__ 
{% highlight json %}
{
    "{fieldName}": {
          "type": "text",
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
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "content": {
          "type": "text",
          "analyzer": "my_analyzer",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "creator": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "description": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "pubDate": {
          "type": "date"
        },
        "title": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
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
            "html_strip"
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
__curl -XPUT "http://{host:port}/xebia/blog/_bulk" --data-binary @xebiablog.data__
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
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "content": {
          "type": "text",
          "analyzer": "my_analyzer",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "creator": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "description": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "pubDate": {
          "type": "date"
        },
        "title": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
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
            "lowercase","my_synonym"
          ],
          "char_filter": [
            "html_strip"
          ]
        }
      },
      "filter": {
        "my_synonym": {
          "type": "synonym",
          "synonyms": [
            "lightbend, typesafe => lightbend"
          ]
        }
      },
      "tokenizer": {},
      "char_filter": {}
    }
  }
}
{% endhighlight %}
__curl -XPUT "http://{host:port}/xebia/blog/_bulk" --data-binary @xebiablog.data__
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
  afin de pouvoir exécuter la même requête conjointement sur le champ "content" et le champ "title". Cette requête **multi_match** doit être de type **most_fields** pour combiner le score des champs qui match.   
  

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
            "fields": ["content","title"],
            "type": "most_fields"
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
__3.9 Suggestion :__   
  Nous souhaitons être capable de faire de la suggestion sur le titre des posts dès la première lettre saisie. Pour cela, vous allez utiliser l'api __Completion suggester :__    
  
  -  Ajoutez un champ "suggest" au mapping, de type __completion__ . Ce champ va contenir le texte pour la suggestion mais sera indexé dans une structure optimisée pour faire de la recherche rapide sur du texte.  
  - Utilisez le fichier [xebiablogWithSuggest.data](data/xebiablogWithSuggest.data) pour l'indexation. Ce fichier contient les mêmes documents mais avec le champ suggest au format suivant :   
{% highlight json %}
  {
    "suggest": {
            "input": ["<suggest_text>"]
    }
  }
{% endhighlight %}
---  
  - Effectuer une requête de type suggest   
__Syntaxe :__
GET xebia/blog/_search
{% highlight json %}
{
    "suggest": {
        "<name>" : {
            "prefix" : "<prefix_to_search>",
            "completion" : {
                "field" : "<suggest_field_name>"
            }
        }
    }
}     
{% endhighlight %}

Cette requête doit pouvoir remonter documents dont le titre match sur d, do, doc, dock, docke, docker (auto-completion).  

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
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "content": {
          "type": "text",
          "analyzer": "my_analyzer",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "creator": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "description": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "pubDate": {
          "type": "date"
        },
        "title": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "suggest": {
          "type": "completion"
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
            "lowercase","my_synonym"
          ],
          "char_filter": [
            "html_strip"
          ]
        }
      },
      "filter": {
        "my_synonym": {
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

GET xebia/blog/_search
{% highlight json %}   
{
    "suggest": {
        "song-suggest" : {
            "prefix" : "do",
            "completion" : {
                "field" : "suggest"
            }
        }
    }
}
{% endhighlight %}
</blockquote>
---
__3.10 Suggestion fuzzy:__   
  Problème l'api de suggestion ne remonte pas de résultat si la personne qui effectue la recherche se trompe dans la saisie du texte.   
   Modifiez la requête de suggestion afin de pouvoir remonter les suggestions liées à Docker si l'on saisie "Doker".  
   Pour cela, ajoutez le paramètre `"fuzzy":{}` à la requête au même niveau que **field**.
<blockquote class = 'solution' markdown="1">
GET xebia/blog/_search
{% highlight json %}   
{
    "suggest": {
        "song-suggest" : {
            "prefix" : "Doker",
             "completion" : {
                "field" : "suggest",
                 "fuzzy":{}
            }
        } 
    }
}
{% endhighlight %}
</blockquote>
---
__3.11 Agrégations par categories:<a name="3.11"></a>__   
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

__Attention__ : On doit remonter le texte contenu dans le champ __category__ sans analyse. Depuis Elasticsearch 5, les champs textes sont indexés par défaut avec analyse (**text**) et sans analyse (**keyword**). Pour effectuer une requête sur le champ sans analyse, elle doit porter sur le champ `<nom_du_champ>.keyword`.
L'attribut __size__ est à 0 car on ne tient pas ici à remonter les documents mais  uniquement le résultat de l'aggrégation
  
<blockquote class = 'solution' markdown="1">
GET xebia/blog/_search
{% highlight json %}
{ "size": 0, 
  "aggregations": {
    "by_category": {
      "terms": {
        "field": "category.keyword",
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

__Attention__ : Même problème que l'aggrégation précédente : une aggrégation doit se faire sur un contenu __exact__ (keyword) et donc pas sur un texte analysé.
  
<blockquote class = 'solution' markdown="1">

GET xebia/blog/_search
{% highlight json %}   
{
  "size": 0,
  "aggregations" : {
    "by_categories" :{
      "terms": {
        "field": "category.keyword",
        "size": 10
      },
      "aggregations" :{
        "by_creator" : {
          "terms": {
            "field": "creator.keyword",
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