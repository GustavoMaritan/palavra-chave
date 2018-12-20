const defaultPath = `C:\\`;
const exts = ['txt', 'bat', 'js', 'css', 'html'];

const excludesFolders = ['.git', 'node_modules'];
const palavraChave = ['qVYMnx8wB72zHByYqLwrf291jbavbFz1pXyiXNirjB5sPIjvEaIDHioYWj0GpADr'];

const fs = require('fs');
const path = require('path');


let regexs = [];

palavraChave.map(x => {
    regexs.push(new RegExp(x, 'gi'));
});

let encontrados = [];

umNomequalquer(defaultPath);

function umNomequalquer($path) {
    let files = fs.readdirSync($path);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        //Verifica Folders
        if (excludesFolders.includes(file)) continue;

        let _path = path.join($path, file);

        if (fs.lstatSync(_path).isDirectory()) {
            umNomequalquer(_path);
            continue;
        }

        let _file = file.split('.');
        //Arquivos sem extensao
        if (_file.length != 2) continue;

        //Verifica Extensoes
        if (!exts.includes(_file[1])) continue;

        let arquivo = fs.readFileSync(_path, 'utf8');

        regexs.map(x => {
            if (x.test(arquivo))
                encontrados.push(_path);
        });
    }
}

console.log(encontrados);

var aaa = '';