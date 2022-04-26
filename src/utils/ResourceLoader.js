<<<<<<< HEAD
import FS from 'fs-extra';

const resourceLoader = async () => {

  const serverDataPath = './server_data';
  const resourceFolder = './src/resources';

  if(!FS.existsSync(serverDataPath)) {

    FS.mkdirSync(serverDataPath);
    FS.copySync(resourceFolder, serverDataPath)

  }

  return;
}

=======
import FS from 'fs-extra';

const resourceLoader = async () => {

  const serverDataPath = './server_data';
  const resourceFolder = './src/resources';

  if(!FS.existsSync(serverDataPath)) {

    FS.mkdirSync(serverDataPath);
    FS.copySync(resourceFolder, serverDataPath)

  }

  return;
}

>>>>>>> 73634b6 (main)
export default resourceLoader;