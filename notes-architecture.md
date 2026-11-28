fichiers trop volumineux : 


du code dupliqué ou obsolète : 
 - le code html des composants home et country sont dupliqué (header)

des appels HTTP dans les composants : 
 - il y a un appel http dans les composants home et country

l’absence de typage strict (any) : 

les bouts de code à supprimer (console.log  par exemple) : 
 - il y a un console.log dans home


la mauvaise gestion des observables : 
 - il n'y a pas de gestion des observables (appels http sont subscribe mais pas unsubscribe)