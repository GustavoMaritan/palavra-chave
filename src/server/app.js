
const fs = require('fs');
const JQ = require('jquery');
const path = require('path');
const { shell } = require('electron');
const exts = ['txt', 'bat', 'js', 'css', 'html', 'sql'];
const excludesFolders = ['.git', 'node_modules'];
let regexs, encontrados, pesquisados, arquivos, extsFilter, fileRegex;

module.exports = {
    pesquisar,
    openFile,
    extensoes,
    openDiretorio,
    ordenar
}

function extensoes() {
    exts.map(x => {
        JQ('.extensoes').append(`
            <div>
                <input data-chk-item type="checkbox" value="${x}" name="ext-${x}" id="ext-${x}" checked>
                <label for="ext-${x}">${x}</label>
            </div>
        `);
    });
}

function openFile(_path) {
    let a = shell.openItem(_path);
}

function openDiretorio(_path) {
    _path = _path.split('\\');
    _path.pop();

    shell.openItem(_path.join('\\'));
}

async function pesquisar(_path, palavraChave, _exts, _file1) {
    extsFilter = _exts || [];
    fileRegex = _file1 ? new RegExp(_file1, 'gi') : null;
    regexs = [];
    encontrados = [];
    pesquisados = 0;
    arquivos = [];
    palavraChave = Array.isArray(palavraChave) ? palavraChave : [palavraChave];
    palavraChave.map(x => {
        regexs.push(new RegExp(x, 'gi'));
    });
    JQ('.resultados>table>tbody').empty();
    await filtrar(_path);

    let message = encontrados.length
        ? `${encontrados.length} encontrado${encontrados.length > 1 ? 's' : ''}`
        : `Nenhum arquivo encontrado.`

    JQ('#span-pesquisando').html(`${message} | ${pesquisados} arquivos pesquisados`);
}

async function filtrar($path) {
    return new Promise((res, rej) => {
        fs.readdir($path, async (err, files) => {
            //pesquisados += files.length;
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                //Verifica Folders
                if (excludesFolders.includes(file)) continue;

                let _path = path.join($path, file);

                JQ('#span-pesquisando').html(`${_path}`);

                if (fs.lstatSync(_path).isDirectory()) {
                    await filtrar(_path);
                    continue;
                }

                if (fileRegex && !fileRegex.test(_path)) continue;
                console.log('_path', _path)

                let _file = file.split('.');
                //Arquivos sem extensao
                if (_file.length != 2) continue;

                //Verifica Extensoes
                if (extsFilter.length && !extsFilter.includes(_file[1])) continue;

                pesquisados += 1;

                let arquivo = fs.readFileSync(_path, 'utf8');

                regexs.map(x => {
                    if (x.test(arquivo)) {
                        let obj = {
                            ocorrencias: arquivo.match(x).length,
                            path: _path,
                            get _path() {
                                return this.path.replace(/\\/g, '\\\\');
                            }
                        };
                        JQ('.resultados>table>tbody').append(`
                            <tr title="${obj.path}" data-arquivo="${obj.path}" data-ocorrencias="${obj.ocorrencias}">
                                <td style="max-width: 200px"><div class="div-table">${obj.path}</div></td>
                                <td style="text-align: center">${obj.ocorrencias}</td>
                                <td title="Abrir" onclick="openFile('${obj._path}')"><i class="material-icons">done</i></td>
                                <td title="Ir Para" onclick="openDiretorio('${obj._path}')"><i class="material-icons">folder_open</i></td>
                            </tr>          
                        `);
                        arquivos.push(obj);
                        encontrados.push(_path);
                    }
                });
            }
            res();
        });
    });
}

function ordenar(tipo) {
    tipo = tipo == 'o' ? 'ocorrencias' : 'path';

    if (JQ('.resultados>table>tbody').attr('data-tipo') == tipo) {
        arquivos = arquivos.sort(function (a, b) {
            return b[tipo] - a[tipo];
        });
        createTable('');
        return
    }

    arquivos = arquivos.sort(function (a, b) {
        return a[tipo] - b[tipo];
    });
    createTable(tipo);
}

function createTable(tipo) {
    JQ('.resultados>table>tbody').empty();
    JQ('.resultados>table>tbody').attr('data-tipo', tipo);
    arquivos.forEach(obj => {
        JQ('.resultados>table>tbody').append(`
            <tr title="${obj.path}" data-arquivo="${obj.path}" data-ocorrencias="${obj.ocorrencias}">
                <td style="max-width: 200px"><div class="div-table">${obj.path}</div></td>
                <td style="text-align: center">${obj.ocorrencias}</td>
                <td title="Abrir" onclick="openFile('${obj._path}')"><i class="material-icons">done</i></td>
                <td title="Ir Para" onclick="openDiretorio('${obj._path}')"><i class="material-icons">folder_open</i></td>
            </tr>          
        `);
    });
}