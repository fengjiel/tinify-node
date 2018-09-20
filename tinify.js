//引用文件系统模块
const fs = require("fs");
const path = require("path");
//引用imageinfo模块
const image = require("imageinfo");
// 引入tinify模块
const tinify = require("tinify");

const fromDirName = 'public';
const toDirName = "public-min";

tinify.key = 'nmJGcvStI9okwiS4y2tX2Fru8dm13Nxv'; //'your tinify key';
//检测是含有toDirName 文件夹
function fsExistsSync(path) {
    try {
        fs.accessSync(path, fs.F_OK);
    } catch (e) {
        return false;
    }
    return true;
}
if (!fsExistsSync(path.join(__dirname, "./" + toDirName + "/"))) {
    fs.mkdir(path.join(__dirname, "./" + toDirName + "/"), function (err) {
        if (err) {
            console.log(err)
        }
    });
}
//获取文件大小

function getFileSize(path, filesList) {
    let states = fs.statSync(path);
    return states.size + 'b';
}

function readFileList(path, filesList) {
    let files = fs.readdirSync(path);
    files.forEach(function (itm, index) {
        let stat = fs.statSync(path + itm);
        if (stat.isDirectory()) {
            //递归读取文件
            readFileList(path + itm + "/", filesList)
        } else {
            let obj = {}; //定义一个对象存放文件的路径和名字
            obj.path = path; //路径
            obj.filename = itm //名字
            obj.size = getFileSize(path + itm)
            filesList.push(obj);
        }

    })

}
let getFiles = {
    //获取文件夹下的所有文件
    getFileList: function (path) {
        let filesList = [];
        readFileList(path, filesList);
        return filesList;
    },
    //获取文件夹下的所有图片
    getImageFiles: function (path) {
        let imageList = [];
        this.getFileList(path).forEach((item) => {
            let ms = image(fs.readFileSync(item.path + item.filename));
            ms.mimeType && (imageList.push({
                name: item.filename,
                path: item.path,
                size: item.size
            }))
        });
        return imageList;

    }
};

//获取文件夹下的所有图片
let getImageFiles = getFiles.getImageFiles("./" + fromDirName + '/');

const compress = async (getImageFiles) => {
    for (let pic of getImageFiles) {
        await tinify.fromFile(path.join(__dirname, "./" + pic.path + pic.name)).toFile(path.join(__dirname, "./" + toDirName + "/" + pic.name));
        console.log(`文件 ${pic.name} 压缩完成！  ${pic.size} -> ${getFileSize(path.join(__dirname, "./" + toDirName + "/" + pic.name))}`)
    }
}
compress(getImageFiles);