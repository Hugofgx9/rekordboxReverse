
const ipc = require('electron').ipcRenderer;
const fs = require('fs');
const convert = require('xml-js');

let $button = document.querySelector('button');
$button.addEventListener('click', () => {
  ipc.send('open-file-dialog');
});


ipc.on('selectedElement', (event, path) => {
  fs.readFile(path.filePaths[0], 'utf8', function(err, data) {
    let json = convert.xml2json(data, {compact: true, spaces: 4});
    let resp = JSON.parse(json);

    let playlists = resp.DJ_PLAYLISTS.PLAYLISTS.NODE.NODE;
    // playlists.forEach( (el) => {
    //   console.log(el);
    // });
    firstOrCreate('playlist');
    playlistTraitement(playlists, 'playlist');


  });
})


function playlistTraitement(playlistArray, parent) {
  console.log(parent);

  for (const i in playlistArray) {
    //console.log(playlistArray[i]);

    if ( playlistArray[i]._attributes ) {
      const correctFolderName = playlistArray[i]._attributes.Name.replace('/', '_');
      const path = `${parent}/${correctFolderName}`;
      // if array is a playlist
      if ( playlistArray[i]._attributes.Type == 1) {
        //console.log(`Playlist ${path}`);
        firstOrCreate(path);
      }
      
      //if obj is a folder -> recurrence
      else if ( playlistArray[i]._attributes.Type == 0 ) {
        //console.log(`FOLDER ${parent}/${playlistArray[i]._attributes.Name}`);
        //firstOrCreate(path);
        playlistTraitement(playlistArray[i].NODE, path);
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
