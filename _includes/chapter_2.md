### 2. Découverte de l'api


   __2.1 Premier document indexé :__    
Requête :    
__POST__ programmer/person/1
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
    
---  
           
   __2.2 Retrouver le document par son id :__  
Requête :  
__GET__ programmer/person/1  
    
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

  __2.5 Recherche full text <a name="2.5"></a>:__  
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
__GET__ programmer/person/_searh
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