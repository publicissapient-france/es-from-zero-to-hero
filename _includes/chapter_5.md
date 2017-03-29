### 4. Analyse d'opérations bancaires

Vous travaillez actuelement sur l'application de gestion des comptes bancaires de la banque X-Banque. 
Les mouvements sont indexés dans Elasticsearch avec le format suivant  : 

* __amount__ : Le montant de l'opération
* __operationDate__ : Date/heure de l'opération
* __type__ : type d'opération, 2 valeurs possibles : credit et debit
* __userId__ : l'identifiant du propriétaire du compte 
    
Voici un exemple : 
{% highlight json %}   
{
  "amount": 914,
  "operationDate": "2017-03-31T17:18",
  "type": "debit",
  "userId": "richard.serge"
}{% endhighlight %}  


L'objectif de ce chapitre est de construire pas à pas des requêtes d'agrégations complexe afin de 
pouvoir extraire de l'information de ces opérations.

---
__4.1 Indexer les documents__  
Pour indexer tous ces documents en une étape vous allez utiliser curl :  

 * Télécharger le dataset [operations.data](data/operations.data)
 * Exécuter une requête bulk indexing :  
  `curl -XPUT http://{host:port}/bank-account/operation/_bulk --data-binary @operations.data`
  
 __Vérifier que les 124 documents sont correctements indexés :__  
 __GET__ bank-account/_count
   
---                                     
__4.2 Simple agrégation : Opérations par mois__  
Afin de remonter le nombre d'opérations par mois, écrire de même que pour l'exercice 3.11, une agrégation mais cette fois 
de type **date_histogram**.  
**Aider vous de l'auto-complétion des devs tools pour déterminer les paramètres de cette agrégation.**

<blockquote class = 'solution' markdown="1">

GET bank-account/operation/_search
{% highlight json %}   
{
  "size": 0,
  "aggregations": {
    "by_month": {
      "date_histogram": {
        "field": "operationDate",
        "interval": "month"
      }
    }
  }
}
{% endhighlight %}
</blockquote>

---    
__4.2 Sous agrégation : opérations par mois et par userId__  
Afin de remonter les opérations par mois de chaque compte (userId), ajouter à l'agrégation précédente une sous-agrégation (format exercice 3.12) de type **term** qui cible 
la valeur "non analysée" du champ userId.

<blockquote class = 'solution' markdown="1">

GET bank-account/operation/_search
{% highlight json %}   
{
  "size": 0,
  "aggregations": {
    "by_month": {
      "date_histogram": {
        "field": "operationDate",
        "interval": "month"
      },
      "aggregations": {
        "by_user_id": {
          "terms": {
            "field": "userId.keyword"
          }
        }
      }
    }
  }
}
{% endhighlight %}
</blockquote>

---    
__4.3 Filtre sur agrégation : agréger uniquement les crédits__  
L'objectif est de construire une requête permetant de détecter des montants trop important reçus. Il ne faut donc 
garder que les opérations dont le type est **credit**.  
Ajouter à l'agrégation précédente une **query** avec un filtre sur ce champ afin de remonter les débits par mois pour chaques comptes.

<blockquote class = 'solution' markdown="1">

GET bank-account/operation/_search
{% highlight json %}   
{
  "size": 0,
  "query": {
    "bool": {
      "filter": {
        "term": {
          "type.keyword": "credit"
        }
      }
    }
  },
  "aggregations": {
    "by_month": {
      "date_histogram": {
        "field": "operationDate",
        "interval": "month"
      },
      "aggregations": {
        "by_user_id": {
          "terms": {
            "field": "userId.keyword"
          }
        }
      }
    }
  }
}
{% endhighlight %}
</blockquote>

---    