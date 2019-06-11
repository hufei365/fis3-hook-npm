const fs = require('fs');
const path = require('path');

const ns = fis.get('namespace') || String(+new Date);
const imports = fis.get('import') || [];

let maps = [], map=null;

imports.forEach( _import=>{
    
const importsMaps = JSON.parse(fs.readFileSync(
                path.join(fis.project.getCachePath('conf'),  _import + '-map.json') ).toString());

    for(let k of Object.keys(importsMaps.res)){
        maps.push( k );
        if( importsMaps.res[k].extras ){
            let extra = importsMaps.res[k].extras.moduleId;
            if(extra && extra !== k){
                maps.push(extra)
                maps[extra] = k;
            }
        }
    }
});

// 收集所有依赖模块中的npm包
map = new Set(maps);

fis.unhook('components');
fis.hook('commonjs', {
    extList: ['.js', '.jsx', '.es6', '.ts', '.tsx', '.vue']
});

let lookup = fis.require('hook-commonjs/lookup.js');

fis.hook('node_modules');

let tryNpmLookUp = null;

function tryNpmLookUp2(info, file, opts){
    
    let ret = tryNpmLookUp(info, file, opts);
    
    if(ret && ret.file){
        let moduleId = ret.file.moduleId.replace(fis.get('namespace') + ':', '');

        if(/^node_modules/.test(moduleId)){

            imports.some( _import=>{
                let fulModuleId = _import + ':' + moduleId;
                if ( map.has(fulModuleId) ){
                    let lastModuleId = maps[fulModuleId] || fulModuleId;
                    file._content = file._content.replace(info.origin, lastModuleId);
                    info.origin = info.rest = lastModuleId;
                    info.isFISID = true;
                    info.isFisId = true;
                }
            });
        }        
    }
}
// add a new lookup
module.exports = function(fis, file, silent){
    tryNpmLookUp = lookup.lookupList[3];
    lookup.lookupList = [
        tryNpmLookUp2,
        lookup.tryFisIdLookUp,
        lookup.tryPathsLookUp,
        lookup.tryPackagesLookUp,
        lookup.lookupList[3], //  tryNpmLookUp2
        lookup.tryFolderLookUp,
        lookup.tryNoExtLookUp,
        lookup.tryBaseUrlLookUp,
        lookup.tryRootLookUp
    ];
}


fis.match('/node_modules/(*)/**.js', {
    isMod: true,
    release: true,
    packTo: '/node_modules/'+ns+'-$1-pkg.js'
});