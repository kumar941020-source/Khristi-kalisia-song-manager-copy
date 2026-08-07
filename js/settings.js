// ==========================================
// SETTINGS PAGE (FIREBASE)
// ==========================================


// ==========================================
// BACKUP DATA
// ==========================================


function backupData(){


Promise.all([


db.collection("fastSongs").get(),


db.collection("slowSongs").get(),


db.collection("sundayHistory").get()


])

.then(results=>{



let backup = {


fastSongs: [],


slowSongs: [],


sundayHistory: []


};






results[0].forEach(doc=>{


backup.fastSongs.push({

id:doc.id,

...doc.data()

});


});





results[1].forEach(doc=>{


backup.slowSongs.push({

id:doc.id,

...doc.data()

});


});





results[2].forEach(doc=>{


backup.sundayHistory.push({

id:doc.id,

...doc.data()

});


});








let data =

JSON.stringify(

backup,

null,

2

);






let blob =

new Blob(

[data],

{

type:"application/json"

}

);






let link =

document.createElement("a");




link.href =

URL.createObjectURL(blob);




link.download =

"khristi-kalisia-firebase-backup.json";




link.click();




})

.catch(error=>{


console.log(
"Backup Error:",
error
);


});



}









// ==========================================
// CLEAR ALL FIREBASE DATA
// ==========================================


function clearAllData(){



let confirmDelete =

confirm(

"Are you sure? All Firebase data will be deleted."

);





if(confirmDelete){



Promise.all([



deleteCollection("fastSongs"),


deleteCollection("slowSongs"),


deleteCollection("sundayHistory")


])

.then(()=>{


alert(
"All Firebase Data Cleared"
);


location.reload();


})

.catch(error=>{


console.log(
"Delete Error:",
error
);


});


}


}









// ==========================================
// DELETE COLLECTION
// ==========================================


function deleteCollection(collectionName){


return db
.collection(collectionName)
.get()

.then(snapshot=>{



let batch =
db.batch();




snapshot.forEach(doc=>{


batch.delete(doc.ref);


});



return batch.commit();



});


}








document.addEventListener(

"DOMContentLoaded",

()=>{


console.log(
"Settings Loaded"
);


}

);