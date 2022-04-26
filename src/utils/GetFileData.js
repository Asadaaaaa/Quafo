import FS from 'fs-extra';
import YAML from 'js-yaml';

const getFileData = async (file, fileType) => {

    const serverDataPath = './server_data';
    const filePath = serverDataPath + '/' + file;

    if(!FS.existsSync(serverDataPath)) throw new Error("Directory doesn't exist");
    if(!FS.existsSync(filePath)) throw new Error("File doesn't exist");

    let fileContent = FS.readFileSync(filePath, err => {

        if (err) throw err;

    });
    
    switch(fileType) {

        case "YAML": {

            let objYAML = YAML.load(fileContent);
            
            return objYAML;
        }

        case "JSON": {
            
            return JSON.parse(fileContent);
        }

        default: {

            throw new Error("Unable to recognize file type");
        
        }
        
    }
}
export default getFileData;