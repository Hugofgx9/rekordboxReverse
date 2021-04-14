
const ipc = require('electron').ipcRenderer;
const fs = require('fs');
const convert = require('xml-js');

let $button = document.querySelector('button');
$button.addEventListener('click', () => {
  ipc.send('open-file-dialog');
});

let tracks; 
let missingFiles = [];


ipc.on('selectedElement', (event, path) => {
  fs.readFile(path.filePaths[0], 'utf8', function(err, data) {
    let json = convert.xml2json(data, {compact: true, spaces: 4});
    let resp = JSON.parse(json);

    let playlists = resp.DJ_PLAYLISTS.PLAYLISTS.NODE.NODE;
    tracks = resp.DJ_PLAYLISTS.COLLECTION.TRACK;

    playlistTraitement(playlists, 'playlist');

  });
});

/**
 * @param  {[playlist]} playlistArray
 * @param  {string} parent the parent directory
 */
function playlistTraitement(playlistArray, parent) {

  let count = 0;
  let total = numberOfTracks(playlistArray);
  createFolders(playlistArray, parent);
  console.log(missingFiles);


  function numberOfTracks(playlistArray){
    let nb = 0;

    for (const i in playlistArray) {
      if ( playlistArray[i]._attributes ) {

        // if array is a playlist
        if ( playlistArray[i]._attributes.Type == 1) {
          nb += parseInt(playlistArray[i]._attributes.Entries);
        }

        //if obj is a folder -> recurrence
        else if ( playlistArray[i]._attributes.Type == 0 ) {
          nb += parseInt(numberOfTracks(playlistArray[i].NODE));
        }
      }
    }

    return nb;
  }

  function createFolders(playlistArray, parent) {
    for (const i in playlistArray) {
  
      if ( playlistArray[i]._attributes ) {
  
        const correctFolderName = playlistArray[i]._attributes.Name.replace('/', '_');
        const path = `${parent}/${correctFolderName}`;
  
        // if array is a playlist
        if ( playlistArray[i]._attributes.Type == 1) {
          firstOrCreate(path);
          fillDir(playlistArray[i], path)
        }
        
        //if obj is a folder -> recurrence
        else if ( playlistArray[i]._attributes.Type == 0 ) {
          firstOrCreate(path);
          createFolders(playlistArray[i].NODE, path);
        }
      }
    }
  }

  function fillDir(playlist, dirPath) {

    for (const trackOfPlaylist of playlist.TRACK) {

      let track = tracks.find( t => t._attributes.TrackID == trackOfPlaylist._attributes.Key)

      let sourcePath = track._attributes.Location;
      sourcePath = sourcePath.replace(new RegExp('.+?(?=\/Users)'), ''); //remove le début
      sourcePath = decodeURIComponent(sourcePath); //special chars from utf8 to chars
      const fileName = sourcePath.replace(new RegExp('.*\/(.*)'), '$1');

      //console.log('hello', count);

      if ( isFileExist(sourcePath) ) {
        fs.copyFileSync(sourcePath, `./${dirPath}/${fileName}`, fs.constants.COPYFILE_FICLONE)
        count++;
        //console.log(count + '/' + total);
      } else {
        console.error('le fichier n\'existe pas' + sourcePath);
        missingFiles.push(sourcePath);
      }
    }
  }

}

/**
 * @param  {sting} dir the directory path
 */
function firstOrCreate(dir) {
  const base = './';
  if (!fs.existsSync(base+dir)){
    fs.mkdirSync(base+dir, { recursive: true });
    //console.log(dir + ' created');
  }
}


/**
 * @param  {string} path the path of the file
 * 
 * @return  {boolean} 
 */
function isFileExist(path) {
  //si le fichier existe 
  if (fs.existsSync(path)) {
    return true
  } 
  //le fichier n'existe pas 
  else {
    return false;
  }
}