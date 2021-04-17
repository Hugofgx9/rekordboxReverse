const fs = require('fs');
const convert = require('xml-js');

module.exports = class CopyFiles {
  constructor(files) {
    this.path = files.filePaths[0];
    console.log(this.path);
    this.parseJson();
  }
  
  parseJson() {
    fs.readFile(this.path, 'utf8', (err, data) => {
      let json = convert.xml2json(data, {compact: true, spaces: 4});
      let resp = JSON.parse(json);
      
      this.playlists = resp.DJ_PLAYLISTS.PLAYLISTS.NODE.NODE;
      this.tracks = resp.DJ_PLAYLISTS.COLLECTION.TRACK;
      
      this.startCopy(this.playlists, 'playlist');
    });
  }

  /**
   * @param  {[playlist]} playlistArray
   * @param  {string} parent the parent directory
   */
  startCopy(playlistArray, parent) {

    let that = this;
    let count = 0;
    let total = numberOfTracks(playlistArray);
    let missingFiles = [];
    createDirs(playlistArray, parent);
  
    //count the nb of tracks
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
  
    // create Directories
    function createDirs(playlistArray, parent) {
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
            createDirs(playlistArray[i].NODE, path);
          }
        }
      }
    }
  
    //fill directory avec les bons fichiers
    function fillDir(playlist, dirPath) {
  
      for (const trackOfPlaylist of playlist.TRACK) {
  
        let track = that.tracks.find( t => t._attributes.TrackID == trackOfPlaylist._attributes.Key)
  
        let sourcePath = track._attributes.Location;
        sourcePath = sourcePath.replace(new RegExp('.+?(?=\/Users)'), ''); //remove le début
        sourcePath = decodeURIComponent(sourcePath); //special chars from utf8 to chars
        const fileName = sourcePath.replace(new RegExp('.*\/(.*)'), '$1');
        
        //console.log('hello', count);
  
        if ( isFileExist(sourcePath) ) {
          fs.copyFileSync(sourcePath, `./${dirPath}/${fileName}`, fs.constants.COPYFILE_FICLONE)
          //console.log(count + '/' + total);
          //$progressBar.style.width = `10%`;
        } else {
          console.error('le fichier n\'existe pas' + sourcePath);
          missingFiles.push(sourcePath);
        }
        
        count++;
      }
    }
  }

}


//utils fonctions

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