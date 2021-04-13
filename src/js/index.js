
const ipc = require('electron').ipcRenderer;
const fs = require('fs');
const convert = require('xml-js');

let $button = document.querySelector('button');
$button.addEventListener('click', () => {
  ipc.send('open-file-dialog');
});


//fs.mkdirSync('/Users/hugofaugeroux/hello', { recursive: true });


ipc.on('selectedElement', (event, path) => {
  fs.readFile(path.filePaths[0], 'utf8', function(err, data) {
    let json = convert.xml2json(data, {compact: true, spaces: 4});
    let resp = JSON.parse(json);

    let playlists = resp.DJ_PLAYLISTS.PLAYLISTS.NODE.NODE;
    let tracks = resp.DJ_PLAYLISTS.COLLECTION.TRACK;

    let counter = 0;

    tracks.forEach(  track => {

      //let track = tracks[100];

      let path = track._attributes.Location;
      path = path.replace(new RegExp('.+?(?=\/Users)'), ''); //remove le début
      path = decodeURIComponent(path); //special chars from utf8 to chars

      //si le fichier existe 
      if (fs.existsSync(path)) {
        counter++;
      } 
      //le fichier n'existe pas 
      else {
      }

    });
    //playlistTraitement(playlists, 'playlist');

    console.log(`${counter}/${tracks.length} files found`);


  });
})


function playlistTraitement(playlistArray, parent) {

  function createFolders(playlistArray, parent) {
    for (const i in playlistArray) {
  
      if ( playlistArray[i]._attributes ) {
  
        const correctFolderName = playlistArray[i]._attributes.Name.replace('/', '_');
        const path = `${parent}/${correctFolderName}`;
  
        // if array is a playlist
        if ( playlistArray[i]._attributes.Type == 1) {
          firstOrCreate(path);
        }
        
        //if obj is a folder -> recurrence
        else if ( playlistArray[i]._attributes.Type == 0 ) {
          firstOrCreate(path);
          createFolders(playlistArray[i].NODE, path);
        }
      }
    }

  }

}


function firstOrCreate(dir) {
  if (!fs.existsSync('./'+dir)){
    fs.mkdirSync('./'+dir, { recursive: true });
    console.log(dir + ' created');
  }
}