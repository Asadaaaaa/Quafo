<<<<<<< HEAD
import FS from 'fs-extra';
import YAML from 'js-yaml';

const saveFileData = async (data, file, fileType) => {

    const serverDataPath = './server_data';
    const filePath = serverDataPath + '/' + file;
    
    if(!FS.existsSync(serverDataPath)) throw new Error("Directory doesn't exist");

    switch(fileType) {

        case "YAML": {

            let strYAML =  YAML.dump(data);

            FS.writeFileSync(filePath, strYAML, err => {

                if (err) console.log("Error writing file:", err);

            });
            
            return;
        }

        case "JSON": {
            
            let strJSON = JSON.stringify(data, null, 2); 
            
            FS.writeFileSync(filePath, strJSON, err => {
            
                if (err) console.log("Error writing file:", err);
            
            });
            
            return;
        }

        default: {

            throw new Error("Unable to recognize file type");
        
        }

    }

}

=======
import FS from 'fs-extra';
import YAML from 'js-yaml';

const saveFileData = async (data, file, fileType) => {

    const serverDataPath = './server_data';
    const filePath = serverDataPath + '/' + file;
    
    if(!FS.existsSync(serverDataPath)) throw new Error("Directory doesn't exist");

    switch(fileType) {

        case "YAML": {

            let strYAML =  YAML.dump(data);

            FS.writeFileSync(filePath, strYAML, err => {

                if (err) console.log("Error writing file:", err);

            });
            
            return;
        }

        case "JSON": {
            
            let strJSON = JSON.stringify(data, null, 2); 
            
            FS.writeFileSync(filePath, strJSON, err => {
            
                if (err) console.log("Error writing file:", err);
            
            });
            
            return;
        }

        default: {

            throw new Error("Unable to recognize file type");
        
        }

    }

}

>>>>>>> 73634b6 (main)
export default saveFileData;