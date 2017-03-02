
const http = require('providers/http');
const editData = require('providers/editData');

class FileSystem {
    createFile(path,content,callback){
        return http.post('/fileSystem/createFile',{
            path:path,
            content:content,
            projectName: editData.projectName
        },callback);
    }
    uploadFile(file,params,callback){
        params = params || {};
        params.projectName = editData.projectName;
        return http.postMultiPart('/fileSystem/uploadFile',file,params,callback);
    }
    readFile(path,callback){
        return http.post('/fileSystem/readFile',{
            path:path,
            projectName: editData.projectName
        },callback);
    }
    renameFolder(oldName,newName,callback){
        return http.post('/fileSystem/renameFolder',{oldName:oldName,newName:newName},callback);
    }
    deleteFolder(name,callback){
        return http.post('/fileSystem/deleteFolder',{name:name},callback);
    }
}

module.exports = new FileSystem();