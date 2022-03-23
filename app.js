const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");
const rl = require("readline");
const Table = require("cli-table");
const colors = require("colors");
const glob = require("glob");
const parser = new xml2js.Parser();

const rli = rl.createInterface({
    input: process.stdin,
    output: process.stdout
});

let table = new Table({});

table.push(
    [ 1, "Merge vehicles.meta" ],
    [ 2, "Merge carcols.meta" ],
    [ 3, "Merge carvariations.meta" ],
    [ 4, "Merge handling.meta" ],
    [ 5, "Merge vehiclelayouts.meta" ],
    [ 6, "Merge all of the above".cyan ],
    [ 7, "Import all vehicles.meta files from directory".magenta ],
    [ 8, "Import all carcols.meta files from directory".magenta ],
    [ 9, "Import all carvariations.meta files from directory".magenta ],
    [ 10, "Import all handling.meta files from directory".magenta ],
    [ 11, "Import all vehiclelayouts.meta files from directory".magenta ],
    [ 12, "Import all of the above from directory".magenta ],
    [ 13, "Import other files from directory by search query".magenta ],
    [ 14, "Extract model names from vehicles.meta files".green ],
    [ 15, "Exit".red ],
);

console.log(`mmVehiclesMetaMerger by ${"mmleczek.com".cyan} for ${"reective.com".cyan}`);

ProgramStart();

function ProgramStart() {
    if (!fs.existsSync(`${getDir()}/vehicles_meta`)) fs.mkdirSync(`${getDir()}/vehicles_meta`, { recursive: true });
    if (!fs.existsSync(`${getDir()}/carcols_meta`)) fs.mkdirSync(`${getDir()}/carcols_meta`, { recursive: true });
    if (!fs.existsSync(`${getDir()}/carvariations_meta`)) fs.mkdirSync(`${getDir()}/carvariations_meta`, { recursive: true });
    if (!fs.existsSync(`${getDir()}/handling_meta`)) fs.mkdirSync(`${getDir()}/handling_meta`, { recursive: true });
    if (!fs.existsSync(`${getDir()}/vehiclelayouts_meta`)) fs.mkdirSync(`${getDir()}/vehiclelayouts_meta`, { recursive: true });
    if (!fs.existsSync(`${getDir()}/output`)) fs.mkdirSync(`${getDir()}/output`, { recursive: true });
    AskForFileType();
}

function AskForFileType() {
    console.log(table.toString());
    rli.question("Choose action (1 - 15): ", async (answer) => {
        if (Number(answer)) {
            console.log(answer);
            let a = Number(answer);
            if (a > 0 && a <= 15) {
                if (a == 1) {
                    VehiclesMetaProcedure().then(() => AskForFileType());
                } else if (a == 2) {
                    CarcolsMetaProcedure().then(() => AskForFileType());
                } else if (a == 3) {
                    CarvariationsMetaProcedure().then(() => AskForFileType());
                } else if (a == 4) {
                    HandlingMetaProcedure().then(() => AskForFileType());
                } else if (a == 5) {
                    VehicleLayoutsMetaProcedure().then(() => AskForFileType());
                } else if (a == 6) {
                    await VehiclesMetaProcedure();
                    await CarcolsMetaProcedure();
                    await CarvariationsMetaProcedure();
                    await HandlingMetaProcedure();
                    await VehicleLayoutsMetaProcedure();
                    AskForFileType()
                } else if (a >= 7 && a < 13) {
                    rli.question("Path to directory: ", async (path_) => {
                        if (a == 7) {
                            ImportVehiclesMetaFromDir(path_).then(() => AskForFileType()).catch((e) => {
                                console.log(e);
                                setTimeout(() => AskForFileType(), 1000);
                            });
                        } else if (a == 8) {
                            ImportCarcolsMetaFromDir(path_).then(() => AskForFileType()).catch((e) => {
                                console.log(e);
                                setTimeout(() => AskForFileType(), 1000);
                            });
                        } else if (a == 9) {
                            ImportCarvariationsMetaFromDir(path_).then(() => AskForFileType()).catch((e) => {
                                console.log(e);
                                setTimeout(() => AskForFileType(), 1000);
                            });
                        } else if (a == 10) {
                            ImportHandlingMetaFromDir(path_).then(() => AskForFileType()).catch((e) => {
                                console.log(e);
                                setTimeout(() => AskForFileType(), 1000);
                            });
                        } else if (a == 11) {
                            ImportVehicleLayoutsMetaFromDir(path_).then(() => AskForFileType()).catch((e) => {
                                console.log(e);
                                setTimeout(() => AskForFileType(), 1000);
                            });
                        } else if (a == 12) {
                            await ImportVehiclesMetaFromDir(path_).catch((e) => console.log(e));
                            await ImportCarcolsMetaFromDir(path_).catch((e) => console.log(e));
                            await ImportCarvariationsMetaFromDir(path_).catch((e) => console.log(e));
                            await ImportHandlingMetaFromDir(path_).catch((e) => console.log(e));
                            await ImportVehicleLayoutsMetaFromDir(path_).catch((e) => console.log(e));
                            AskForFileType();
                        }
                    });
                } else if (a == 13) {
                    await ImportFileByQueryFromDir().catch((e) => console.log(e));
                    setTimeout(() => AskForFileType(), 1000);
                } else if (a == 14) {
                    await ExtractModelNamesFromVehiclesMeta().catch((e) => console.log(e));
                    setTimeout(() => AskForFileType(), 1000);
                } else if (a == 15) {
                    process.exit(0);
                }
            } else {
                console.log("Wrong number, program only accept number in range from 1 to 13.".red);
                console.log("\n");
                AskForFileType();
            }
        } else {
            console.log("Wrong number, try again".red);
            console.log("\n");
            AskForFileType();
        }
    });
}

function ExtractModelNamesFromVehiclesMeta() {
    let e = new Promise(function(resolve, reject) {
        console.log("Extracting model names from vehicles.meta files...".cyan);
        GetFiles(`${getDir()}/vehicles_meta`, function(files) {
            ExtractModelNamesVehicleMetas(files);
            resolve();
        });
    });
    return e;
}

function VehiclesMetaProcedure() {
    let e = new Promise(function(resolve, reject) {
        console.log("Merging all vehicles.meta files...".cyan);
        GetFiles(`${getDir()}/vehicles_meta`, function(files) {
            MergeVehicleMetas(files);
            resolve();
        });
    });
    return e;
}

function CarcolsMetaProcedure() {
    let e = new Promise(function(resolve, reject) {
        console.log("Merging all carcols.meta files...".cyan);
        GetFiles(`${getDir()}/carcols_meta`, function(files) {
            MergeCarcolsMetas(files);
            resolve();
        });
    });
    return e;
}

function CarvariationsMetaProcedure() {
    let e = new Promise(function(resolve, reject) {
        console.log("Merging all carvariations.meta files...".cyan);
        GetFiles(`${getDir()}/carvariations_meta`, function(files) {
            MergeCarvariationsMetas(files);
            resolve();
        });
    });
    return e;
}

function HandlingMetaProcedure() {
    let e = new Promise(function(resolve, reject) {
        console.log("Merging all handling.meta files...".cyan);
        GetFiles(`${getDir()}/handling_meta`, function(files) {
            MergeHandlingMetas(files);
            resolve();
        });
    });
    return e;
}

function VehicleLayoutsMetaProcedure() {
    let e = new Promise(function(resolve, reject) {
        console.log("Merging all vehiclelayouts.meta files...".cyan);
        GetFiles(`${getDir()}/vehiclelayouts_meta`, function(files) {
            MergeVehicleLayoutsMetas(files);
            resolve();
        });
    });
    return e;
}

function ParseXML(data) {
    let e = new Promise(function(resolve, reject) {
        parser.parseString(data, function (err, result) {
            if (err) reject(err);
            else resolve(result);
        });
    });

    return e;
}

function GetFiles(path, cb) {
    let files_status = {}
    let files_to_merge = [];
    
    fs.readdir(path, async (err, files) => {
        if (err) console.error(err);
        else {
            if (files.length) {
                fs.writeFileSync(`${getDir()}/errors.txt`, "");
                files.forEach(file => { files_status[file] = false; });

                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const data = await fs.promises.readFile(`${path}/${file}`);
                    await ParseXML(data).then((result) => {
                        files_to_merge.push(result);
                        files_status[file] = true;
                        if (IsEveryObjectTrue(files_status)) cb(files_to_merge);
                        else {
                            if (files.length == (i+1))
                                rli.question("Error occured, fix it before merging files. Press ENTER to exit.".red, (answer) => {
                                    rli.close;
                                    process.exit(0);
                                });
                        }
                    }).catch((e) => {
                        console.log(`There was an error in file ${file}`.red);
                        console.error(e);
                        fs.appendFileSync(`${getDir()}/errors.txt`, `There was an error in file ${file}\n${e}\n\n`);
                    });
                };
            } else {
                console.log(`There were not any files in given path: ${path}`.yellow)
                cb([]);
            }
        }
    });
}

function ExtractModelNamesVehicleMetas(files) {
    if (files.length > 0) {
        let modelNames = "";

        for (let i = 0; i < files.length; i++) {
            for (let j = 0; j < files[i].CVehicleModelInfo__InitDataList.InitDatas.length; j++) {
                if (typeof files[i].CVehicleModelInfo__InitDataList.InitDatas[j] == "object") {
                    let obj = files[i].CVehicleModelInfo__InitDataList.InitDatas[j];
                    if (obj.Item && obj.Item[0] && obj.Item[0].modelName && obj.Item[0].modelName[0])
                        modelNames += `${obj.Item[0].modelName[0]}\n`;
                }
            }
        }

        fs.writeFileSync(`${getDir()}/output/exportedModelNames.txt`, modelNames);
        console.log("Extracting model names from vehicles.meta files done!".green);
    }
}

function MergeVehicleMetas(files) {
    if (files.length > 0) {
        let o = JSON.parse(JSON.stringify(files[0]));

        if (o.CVehicleModelInfo__InitDataList.InitDatas == undefined || o.CVehicleModelInfo__InitDataList.InitDatas == "") o.CVehicleModelInfo__InitDataList.InitDatas = [];
        if (o.CVehicleModelInfo__InitDataList.txdRelationships == undefined || o.CVehicleModelInfo__InitDataList.txdRelationships == "") o.CVehicleModelInfo__InitDataList.txdRelationships = [];
    
        for (let i = 1; i < files.length; i++) {
            for (let j = 0; j < files[i].CVehicleModelInfo__InitDataList.InitDatas.length; j++) {
                if (typeof files[i].CVehicleModelInfo__InitDataList.InitDatas[j] == "object") 
                    o.CVehicleModelInfo__InitDataList.InitDatas.push(files[i].CVehicleModelInfo__InitDataList.InitDatas[j]);
            }
    
            if (files[i].CVehicleModelInfo__InitDataList.txdRelationships) {
                for (let j = 0; j < files[i].CVehicleModelInfo__InitDataList.txdRelationships.length; j++) {
                    if (typeof files[i].CVehicleModelInfo__InitDataList.txdRelationships[j] == "object") 
                        o.CVehicleModelInfo__InitDataList.txdRelationships.push(files[i].CVehicleModelInfo__InitDataList.txdRelationships[j]);
                }
            }
        }
    
        if (o.CVehicleModelInfo__InitDataList.InitDatas.length == 0) o.CVehicleModelInfo__InitDataList.InitDatas.push({});
        if (o.CVehicleModelInfo__InitDataList.txdRelationships.length == 0) o.CVehicleModelInfo__InitDataList.txdRelationships.push({});

        let builder = new xml2js.Builder();
        let xml = builder.buildObject(o).toString();
    
        xml = removeDuplicated("InitDatas", xml)
        xml = removeDuplicated("txdRelationships", xml)
    
        fs.writeFileSync(`${getDir()}/output/vehicles.meta`, xml);
        console.log("Merging all vehicles.meta files done!".green);
    }
}

function MergeCarcolsMetas(files) {
    if (files.length > 0) {
        let o = JSON.parse(JSON.stringify(files[0]));

        if (o.CVehicleModelInfoVarGlobal.Kits == undefined || o.CVehicleModelInfoVarGlobal.Kits == "") o.CVehicleModelInfoVarGlobal.Kits = [];
        if (o.CVehicleModelInfoVarGlobal.Lights == undefined || o.CVehicleModelInfoVarGlobal.Lights == "") o.CVehicleModelInfoVarGlobal.Lights = [];
        if (o.CVehicleModelInfoVarGlobal.Sirens == undefined || o.CVehicleModelInfoVarGlobal.Sirens == "") o.CVehicleModelInfoVarGlobal.Sirens = [];

        for (let i = 1; i < files.length; i++) {
            if (files[i].CVehicleModelInfoVarGlobal.Kits != undefined) {
                for (let j = 0; j < files[i].CVehicleModelInfoVarGlobal.Kits.length; j++) {
                    if (typeof files[i].CVehicleModelInfoVarGlobal.Kits[j] == "object") 
                        o.CVehicleModelInfoVarGlobal.Kits.push(files[i].CVehicleModelInfoVarGlobal.Kits[j]);
                }
            }

            if (files[i].CVehicleModelInfoVarGlobal.Lights != undefined) {
                for (let j = 0; j < files[i].CVehicleModelInfoVarGlobal.Lights.length; j++) {
                    if (typeof files[i].CVehicleModelInfoVarGlobal.Lights[j] == "object") 
                        o.CVehicleModelInfoVarGlobal.Lights.push(files[i].CVehicleModelInfoVarGlobal.Lights[j]);
                }
            }

            if (files[i].CVehicleModelInfoVarGlobal.Sirens != undefined) {
                for (let j = 0; j < files[i].CVehicleModelInfoVarGlobal.Sirens.length; j++) {
                    if (typeof files[i].CVehicleModelInfoVarGlobal.Sirens[j] == "object") 
                        o.CVehicleModelInfoVarGlobal.Sirens.push(files[i].CVehicleModelInfoVarGlobal.Sirens[j]);
                }
            }
        }

        if (o.CVehicleModelInfoVarGlobal.Kits.length == 0) o.CVehicleModelInfoVarGlobal.Kits.push({});
        if (o.CVehicleModelInfoVarGlobal.Lights.length == 0) o.CVehicleModelInfoVarGlobal.Lights.push({});
        if (o.CVehicleModelInfoVarGlobal.Sirens.length == 0) o.CVehicleModelInfoVarGlobal.Sirens.push({});

        let builder = new xml2js.Builder();
        let xml = builder.buildObject(o).toString();

        if (o.CVehicleModelInfoVarGlobal.Kits.length > 1) xml = removeDuplicated("Kits", xml);
        if (o.CVehicleModelInfoVarGlobal.Lights.length > 1) xml = removeDuplicated("Lights", xml);
        if (o.CVehicleModelInfoVarGlobal.Sirens.length > 1) xml = removeDuplicated("Sirens", xml);

        fs.writeFileSync(`${getDir()}/output/carcols.meta`, xml);
        console.log("Merging all carcols.meta files done!".green);
    }
}

function MergeCarvariationsMetas(files) {
    if (files.length > 0) {
        let o = JSON.parse(JSON.stringify(files[0]));

        if (o.CVehicleModelInfoVariation.variationData == undefined || o.CVehicleModelInfoVariation.variationData == "") o.CVehicleModelInfoVariation.variationData = [];

        for (let i = 1; i < files.length; i++) {
            if (files[i].CVehicleModelInfoVariation.variationData != undefined) {
                for (let j = 0; j < files[i].CVehicleModelInfoVariation.variationData.length; j++) {
                    if (typeof files[i].CVehicleModelInfoVariation.variationData[j] == "object")
                        o.CVehicleModelInfoVariation.variationData.push(files[i].CVehicleModelInfoVariation.variationData[j]);
                }
            }
        }
        
        if (o.CVehicleModelInfoVariation.variationData.length == 0) o.CVehicleModelInfoVariation.variationData.push({});

        let builder = new xml2js.Builder();
        let xml = builder.buildObject(o).toString();

        xml = removeDuplicated("variationData", xml);
        fs.writeFileSync(`${getDir()}/output/carvariations.meta`, xml);
        console.log("Merging all carvariations.meta files done!".green);
    }
}

function MergeHandlingMetas(files) {
    if (files.length > 0) {
        let o = JSON.parse(JSON.stringify(files[0]));

        if (o.CHandlingDataMgr.HandlingData == undefined || o.CHandlingDataMgr.HandlingData == "") o.CHandlingDataMgr.HandlingData = [];

        for (let i = 1; i < files.length; i++) {
            if (files[i].CHandlingDataMgr.HandlingData != undefined) {
                for (let j = 0; j < files[i].CHandlingDataMgr.HandlingData.length; j++) {
                    if (typeof files[i].CHandlingDataMgr.HandlingData[j] == "object") 
                        o.CHandlingDataMgr.HandlingData.push(files[i].CHandlingDataMgr.HandlingData[j]);
                }
            }
        }

        if (o.CHandlingDataMgr.HandlingData.length == 0) o.CHandlingDataMgr.HandlingData.push({});

        let builder = new xml2js.Builder();
        let xml = builder.buildObject(o).toString();

        xml = removeDuplicated("HandlingData", xml);
        fs.writeFileSync(`${getDir()}/output/handling.meta`, xml);
        console.log("Merging all handling.meta files done!".green);
    }
}

function MergeVehicleLayoutsMetas(files) {
    if (files.length > 0) {
        let o = JSON.parse(JSON.stringify(files[0]));

        if (o.CVehicleMetadataMgr.AnimRateSets == undefined || o.CVehicleMetadataMgr.AnimRateSets == "") o.CVehicleMetadataMgr.AnimRateSets = [];
        if (o.CVehicleMetadataMgr.ClipSetMaps == undefined || o.CVehicleMetadataMgr.ClipSetMaps == "") o.CVehicleMetadataMgr.ClipSetMaps = [];
        if (o.CVehicleMetadataMgr.VehicleCoverBoundOffsetInfos == undefined || o.CVehicleMetadataMgr.VehicleCoverBoundOffsetInfos == "") o.CVehicleMetadataMgr.VehicleCoverBoundOffsetInfos = [];
        if (o.CVehicleMetadataMgr.BicycleInfos == undefined || o.CVehicleMetadataMgr.BicycleInfos == "") o.CVehicleMetadataMgr.BicycleInfos = [];
        if (o.CVehicleMetadataMgr.POVTuningInfos == undefined || o.CVehicleMetadataMgr.POVTuningInfos == "") o.CVehicleMetadataMgr.POVTuningInfos = [];
        if (o.CVehicleMetadataMgr.EntryAnimVariations == undefined || o.CVehicleMetadataMgr.EntryAnimVariations == "") o.CVehicleMetadataMgr.EntryAnimVariations = [];
        if (o.CVehicleMetadataMgr.VehicleExtraPointsInfos == undefined || o.CVehicleMetadataMgr.VehicleExtraPointsInfos == "") o.CVehicleMetadataMgr.VehicleExtraPointsInfos = [];
        if (o.CVehicleMetadataMgr.DrivebyWeaponGroups == undefined || o.CVehicleMetadataMgr.DrivebyWeaponGroups == "") o.CVehicleMetadataMgr.DrivebyWeaponGroups = [];
        if (o.CVehicleMetadataMgr.VehicleDriveByAnimInfos == undefined || o.CVehicleMetadataMgr.VehicleDriveByAnimInfos == "") o.CVehicleMetadataMgr.VehicleDriveByAnimInfos = [];
        if (o.CVehicleMetadataMgr.VehicleDriveByInfos == undefined || o.CVehicleMetadataMgr.VehicleDriveByInfos == "") o.CVehicleMetadataMgr.VehicleDriveByInfos = [];
        if (o.CVehicleMetadataMgr.VehicleSeatInfos == undefined || o.CVehicleMetadataMgr.VehicleSeatInfos == "") o.CVehicleMetadataMgr.VehicleSeatInfos = [];
        if (o.CVehicleMetadataMgr.VehicleSeatAnimInfos == undefined || o.CVehicleMetadataMgr.VehicleSeatAnimInfos == "") o.CVehicleMetadataMgr.VehicleSeatAnimInfos = [];
        if (o.CVehicleMetadataMgr.VehicleEntryPointInfos == undefined || o.CVehicleMetadataMgr.VehicleEntryPointInfos == "") o.CVehicleMetadataMgr.VehicleEntryPointInfos = [];
        if (o.CVehicleMetadataMgr.VehicleEntryPointAnimInfos == undefined || o.CVehicleMetadataMgr.VehicleEntryPointAnimInfos == "") o.CVehicleMetadataMgr.VehicleEntryPointAnimInfos = [];
        if (o.CVehicleMetadataMgr.VehicleExplosionInfos == undefined || o.CVehicleMetadataMgr.VehicleExplosionInfos == "") o.CVehicleMetadataMgr.VehicleExplosionInfos = [];
        if (o.CVehicleMetadataMgr.VehicleLayoutInfos == undefined || o.CVehicleMetadataMgr.VehicleLayoutInfos == "") o.CVehicleMetadataMgr.VehicleLayoutInfos = [];
        if (o.CVehicleMetadataMgr.VehicleScenarioLayoutInfos == undefined || o.CVehicleMetadataMgr.VehicleScenarioLayoutInfos == "") o.CVehicleMetadataMgr.VehicleScenarioLayoutInfos = [];
        if (o.CVehicleMetadataMgr.SeatOverrideAnimInfos == undefined || o.CVehicleMetadataMgr.SeatOverrideAnimInfos == "") o.CVehicleMetadataMgr.SeatOverrideAnimInfos = [];
        if (o.CVehicleMetadataMgr.InVehicleOverrideInfos == undefined || o.CVehicleMetadataMgr.InVehicleOverrideInfos == "") o.CVehicleMetadataMgr.InVehicleOverrideInfos = [];
        if (o.CVehicleMetadataMgr.FirstPersonDriveByLookAroundData == undefined || o.CVehicleMetadataMgr.FirstPersonDriveByLookAroundData == "") o.CVehicleMetadataMgr.FirstPersonDriveByLookAroundData = [];

        for (let i = 1; i < files.length; i++) {
            if (files[i].CVehicleMetadataMgr.AnimRateSets != undefined) {
                for (let j = 0; j < files[i].CVehicleMetadataMgr.AnimRateSets.length; j++) {
                    if (typeof files[i].CVehicleMetadataMgr.AnimRateSets[j] == "object") 
                        o.CVehicleMetadataMgr.AnimRateSets.push(files[i].CVehicleMetadataMgr.AnimRateSets[j]);
                }
            }

            if (files[i].CVehicleMetadataMgr.ClipSetMaps != undefined) {
                for (let j = 0; j < files[i].CVehicleMetadataMgr.ClipSetMaps.length; j++) {
                    if (typeof files[i].CVehicleMetadataMgr.ClipSetMaps[j] == "object") 
                        o.CVehicleMetadataMgr.ClipSetMaps.push(files[i].CVehicleMetadataMgr.ClipSetMaps[j]);
                }
            }

            if (files[i].CVehicleMetadataMgr.VehicleCoverBoundOffsetInfos != undefined) {
                for (let j = 0; j < files[i].CVehicleMetadataMgr.VehicleCoverBoundOffsetInfos.length; j++) {
                    if (typeof files[i].CVehicleMetadataMgr.VehicleCoverBoundOffsetInfos[j] == "object")
                        o.CVehicleMetadataMgr.VehicleCoverBoundOffsetInfos.push(files[i].CVehicleMetadataMgr.VehicleCoverBoundOffsetInfos[j]);
                }
            }

            if (files[i].CVehicleMetadataMgr.BicycleInfos != undefined) {
                for (let j = 0; j < files[i].CVehicleMetadataMgr.BicycleInfos.length; j++) {
                    if (typeof files[i].CVehicleMetadataMgr.BicycleInfos[j] == "object")
                        o.CVehicleMetadataMgr.BicycleInfos.push(files[i].CVehicleMetadataMgr.BicycleInfos[j]);
                }
            }

            if (files[i].CVehicleMetadataMgr.POVTuningInfos != undefined) {
                for (let j = 0; j < files[i].CVehicleMetadataMgr.POVTuningInfos.length; j++) {
                    if (typeof files[i].CVehicleMetadataMgr.POVTuningInfos[j] == "object")
                        o.CVehicleMetadataMgr.POVTuningInfos.push(files[i].CVehicleMetadataMgr.POVTuningInfos[j]);
                }
            }

            if (files[i].CVehicleMetadataMgr.EntryAnimVariations != undefined) {
                for (let j = 0; j < files[i].CVehicleMetadataMgr.EntryAnimVariations.length; j++) {
                    if (typeof files[i].CVehicleMetadataMgr.EntryAnimVariations[j] == "object")
                        o.CVehicleMetadataMgr.EntryAnimVariations.push(files[i].CVehicleMetadataMgr.EntryAnimVariations[j]);
                }
            }

            if (files[i].CVehicleMetadataMgr.VehicleExtraPointsInfos != undefined) {
                for (let j = 0; j < files[i].CVehicleMetadataMgr.VehicleExtraPointsInfos.length; j++) {
                    if (typeof files[i].CVehicleMetadataMgr.VehicleExtraPointsInfos[j] == "object")
                        o.CVehicleMetadataMgr.VehicleExtraPointsInfos.push(files[i].CVehicleMetadataMgr.VehicleExtraPointsInfos[j]);
                }
            }

            if (files[i].CVehicleMetadataMgr.DrivebyWeaponGroups != undefined) {
                for (let j = 0; j < files[i].CVehicleMetadataMgr.DrivebyWeaponGroups.length; j++) {
                    if (typeof files[i].CVehicleMetadataMgr.DrivebyWeaponGroups[j] == "object")
                        o.CVehicleMetadataMgr.DrivebyWeaponGroups.push(files[i].CVehicleMetadataMgr.DrivebyWeaponGroups[j]);
                }
            }

            if (files[i].CVehicleMetadataMgr.VehicleDriveByAnimInfos != undefined) {
                for (let j = 0; j < files[i].CVehicleMetadataMgr.VehicleDriveByAnimInfos.length; j++) {
                    if (typeof files[i].CVehicleMetadataMgr.VehicleDriveByAnimInfos[j] == "object")
                        o.CVehicleMetadataMgr.VehicleDriveByAnimInfos.push(files[i].CVehicleMetadataMgr.VehicleDriveByAnimInfos[j]);
                }
            }

            if (files[i].CVehicleMetadataMgr.VehicleDriveByInfos != undefined) {
                for (let j = 0; j < files[i].CVehicleMetadataMgr.VehicleDriveByInfos.length; j++) {
                    if (typeof files[i].CVehicleMetadataMgr.VehicleDriveByInfos[j] == "object")
                        o.CVehicleMetadataMgr.VehicleDriveByInfos.push(files[i].CVehicleMetadataMgr.VehicleDriveByInfos[j]);
                }
            }

            if (files[i].CVehicleMetadataMgr.VehicleSeatInfos != undefined) {
                for (let j = 0; j < files[i].CVehicleMetadataMgr.VehicleSeatInfos.length; j++) {
                    if (typeof files[i].CVehicleMetadataMgr.VehicleSeatInfos[j] == "object")
                        o.CVehicleMetadataMgr.VehicleSeatInfos.push(files[i].CVehicleMetadataMgr.VehicleSeatInfos[j]);
                }
            }

            if (files[i].CVehicleMetadataMgr.VehicleSeatAnimInfos != undefined) {
                for (let j = 0; j < files[i].CVehicleMetadataMgr.VehicleSeatAnimInfos.length; j++) {
                    if (typeof files[i].CVehicleMetadataMgr.VehicleSeatAnimInfos[j] == "object")
                        o.CVehicleMetadataMgr.VehicleSeatAnimInfos.push(files[i].CVehicleMetadataMgr.VehicleSeatAnimInfos[j]);
                }
            }

            if (files[i].CVehicleMetadataMgr.VehicleEntryPointInfos != undefined) {
                for (let j = 0; j < files[i].CVehicleMetadataMgr.VehicleEntryPointInfos.length; j++) {
                    if (typeof files[i].CVehicleMetadataMgr.VehicleEntryPointInfos[j] == "object")
                        o.CVehicleMetadataMgr.VehicleEntryPointInfos.push(files[i].CVehicleMetadataMgr.VehicleEntryPointInfos[j]);
                }
            }

            if (files[i].CVehicleMetadataMgr.VehicleEntryPointAnimInfos != undefined) {
                for (let j = 0; j < files[i].CVehicleMetadataMgr.VehicleEntryPointAnimInfos.length; j++) {
                    if (typeof files[i].CVehicleMetadataMgr.VehicleEntryPointAnimInfos[j] == "object")
                        o.CVehicleMetadataMgr.VehicleEntryPointAnimInfos.push(files[i].CVehicleMetadataMgr.VehicleEntryPointAnimInfos[j]);
                }
            }

            if (files[i].CVehicleMetadataMgr.VehicleExplosionInfos != undefined) {
                for (let j = 0; j < files[i].CVehicleMetadataMgr.VehicleExplosionInfos.length; j++) {
                    if (typeof files[i].CVehicleMetadataMgr.VehicleExplosionInfos[j] == "object")
                        o.CVehicleMetadataMgr.VehicleExplosionInfos.push(files[i].CVehicleMetadataMgr.VehicleExplosionInfos[j]);
                }
            }

            if (files[i].CVehicleMetadataMgr.VehicleLayoutInfos != undefined) {
                for (let j = 0; j < files[i].CVehicleMetadataMgr.VehicleLayoutInfos.length; j++) {
                    if (typeof files[i].CVehicleMetadataMgr.VehicleLayoutInfos[j] == "object")
                        o.CVehicleMetadataMgr.VehicleLayoutInfos.push(files[i].CVehicleMetadataMgr.VehicleLayoutInfos[j]);
                }
            }

            if (files[i].CVehicleMetadataMgr.VehicleScenarioLayoutInfos != undefined) {
                for (let j = 0; j < files[i].CVehicleMetadataMgr.VehicleScenarioLayoutInfos.length; j++) {
                    if (typeof files[i].CVehicleMetadataMgr.VehicleScenarioLayoutInfos[j] == "object")
                        o.CVehicleMetadataMgr.VehicleScenarioLayoutInfos.push(files[i].CVehicleMetadataMgr.VehicleScenarioLayoutInfos[j]);
                }
            }

            if (files[i].CVehicleMetadataMgr.SeatOverrideAnimInfos != undefined) {
                for (let j = 0; j < files[i].CVehicleMetadataMgr.SeatOverrideAnimInfos.length; j++) {
                    if (typeof files[i].CVehicleMetadataMgr.SeatOverrideAnimInfos[j] == "object")
                        o.CVehicleMetadataMgr.SeatOverrideAnimInfos.push(files[i].CVehicleMetadataMgr.SeatOverrideAnimInfos[j]);
                }
            }

            if (files[i].CVehicleMetadataMgr.InVehicleOverrideInfos != undefined) {
                for (let j = 0; j < files[i].CVehicleMetadataMgr.InVehicleOverrideInfos.length; j++) {
                    if (typeof files[i].CVehicleMetadataMgr.InVehicleOverrideInfos[j] == "object")
                        o.CVehicleMetadataMgr.InVehicleOverrideInfos.push(files[i].CVehicleMetadataMgr.InVehicleOverrideInfos[j]);
                }
            }

            if (files[i].CVehicleMetadataMgr.FirstPersonDriveByLookAroundData != undefined) {
                for (let j = 0; j < files[i].CVehicleMetadataMgr.FirstPersonDriveByLookAroundData.length; j++) {
                    if (typeof files[i].CVehicleMetadataMgr.FirstPersonDriveByLookAroundData[j] == "object")
                        o.CVehicleMetadataMgr.FirstPersonDriveByLookAroundData.push(files[i].CVehicleMetadataMgr.FirstPersonDriveByLookAroundData[j]);
                }
            }
        }

        if (o.CVehicleMetadataMgr.AnimRateSets.length == 0) o.CVehicleMetadataMgr.AnimRateSets.push({});
        if (o.CVehicleMetadataMgr.ClipSetMaps.length == 0) o.CVehicleMetadataMgr.ClipSetMaps.push({});
        if (o.CVehicleMetadataMgr.VehicleCoverBoundOffsetInfos.length == 0) o.CVehicleMetadataMgr.VehicleCoverBoundOffsetInfos.push({});
        if (o.CVehicleMetadataMgr.BicycleInfos.length == 0) o.CVehicleMetadataMgr.BicycleInfos.push({});
        if (o.CVehicleMetadataMgr.POVTuningInfos.length == 0) o.CVehicleMetadataMgr.POVTuningInfos.push({});
        if (o.CVehicleMetadataMgr.EntryAnimVariations.length == 0) o.CVehicleMetadataMgr.EntryAnimVariations.push({});
        if (o.CVehicleMetadataMgr.VehicleExtraPointsInfos.length == 0) o.CVehicleMetadataMgr.VehicleExtraPointsInfos.push({});
        if (o.CVehicleMetadataMgr.DrivebyWeaponGroups.length == 0) o.CVehicleMetadataMgr.DrivebyWeaponGroups.push({});
        if (o.CVehicleMetadataMgr.VehicleDriveByAnimInfos.length == 0) o.CVehicleMetadataMgr.VehicleDriveByAnimInfos.push({});
        if (o.CVehicleMetadataMgr.VehicleDriveByInfos.length == 0) o.CVehicleMetadataMgr.VehicleDriveByInfos.push({});
        if (o.CVehicleMetadataMgr.VehicleSeatInfos.length == 0) o.CVehicleMetadataMgr.VehicleSeatInfos.push({});
        if (o.CVehicleMetadataMgr.VehicleSeatAnimInfos.length == 0) o.CVehicleMetadataMgr.VehicleSeatAnimInfos.push({});
        if (o.CVehicleMetadataMgr.VehicleEntryPointInfos.length == 0) o.CVehicleMetadataMgr.VehicleEntryPointInfos.push({});
        if (o.CVehicleMetadataMgr.VehicleEntryPointAnimInfos.length == 0) o.CVehicleMetadataMgr.VehicleEntryPointAnimInfos.push({});
        if (o.CVehicleMetadataMgr.VehicleExplosionInfos.length == 0) o.CVehicleMetadataMgr.VehicleExplosionInfos.push({});
        if (o.CVehicleMetadataMgr.VehicleLayoutInfos.length == 0) o.CVehicleMetadataMgr.VehicleLayoutInfos.push({});
        if (o.CVehicleMetadataMgr.VehicleScenarioLayoutInfos.length == 0) o.CVehicleMetadataMgr.VehicleScenarioLayoutInfos.push({});
        if (o.CVehicleMetadataMgr.SeatOverrideAnimInfos.length == 0) o.CVehicleMetadataMgr.SeatOverrideAnimInfos.push({});
        if (o.CVehicleMetadataMgr.InVehicleOverrideInfos.length == 0) o.CVehicleMetadataMgr.InVehicleOverrideInfos.push({});
        if (o.CVehicleMetadataMgr.FirstPersonDriveByLookAroundData.length == 0) o.CVehicleMetadataMgr.FirstPersonDriveByLookAroundData.push({});

        let builder = new xml2js.Builder();
        let xml = builder.buildObject(o).toString();

        if (o.CVehicleMetadataMgr.AnimRateSets.length > 0) xml = removeDuplicated("AnimRateSets", xml);
        if (o.CVehicleMetadataMgr.ClipSetMaps.length > 0) xml = removeDuplicated("ClipSetMaps", xml);
        if (o.CVehicleMetadataMgr.VehicleCoverBoundOffsetInfos.length > 0) xml = removeDuplicated("VehicleCoverBoundOffsetInfos", xml);
        if (o.CVehicleMetadataMgr.BicycleInfos.length > 0) xml = removeDuplicated("BicycleInfos", xml);
        if (o.CVehicleMetadataMgr.POVTuningInfos.length > 0) xml = removeDuplicated("POVTuningInfos", xml);
        if (o.CVehicleMetadataMgr.EntryAnimVariations.length > 0) xml = removeDuplicated("EntryAnimVariations", xml);
        if (o.CVehicleMetadataMgr.VehicleExtraPointsInfos.length > 0) xml = removeDuplicated("VehicleExtraPointsInfos", xml);
        if (o.CVehicleMetadataMgr.DrivebyWeaponGroups.length > 0) xml = removeDuplicated("DrivebyWeaponGroups", xml);
        if (o.CVehicleMetadataMgr.VehicleDriveByAnimInfos.length > 0) xml = removeDuplicated("VehicleDriveByAnimInfos", xml);
        if (o.CVehicleMetadataMgr.VehicleDriveByInfos.length > 0) xml = removeDuplicated("VehicleDriveByInfos", xml);
        if (o.CVehicleMetadataMgr.VehicleSeatInfos.length > 0) xml = removeDuplicated("VehicleSeatInfos", xml);
        if (o.CVehicleMetadataMgr.VehicleSeatAnimInfos.length > 0) xml = removeDuplicated("VehicleSeatAnimInfos", xml);
        if (o.CVehicleMetadataMgr.VehicleEntryPointInfos.length > 0) xml = removeDuplicated("VehicleEntryPointInfos", xml);
        if (o.CVehicleMetadataMgr.VehicleEntryPointAnimInfos.length > 0) xml = removeDuplicated("VehicleEntryPointAnimInfos", xml);
        if (o.CVehicleMetadataMgr.VehicleExplosionInfos.length > 0) xml = removeDuplicated("VehicleExplosionInfos", xml);
        if (o.CVehicleMetadataMgr.VehicleLayoutInfos.length > 0) xml = removeDuplicated("VehicleLayoutInfos", xml);
        if (o.CVehicleMetadataMgr.VehicleScenarioLayoutInfos.length > 0) xml = removeDuplicated("VehicleScenarioLayoutInfos", xml);
        if (o.CVehicleMetadataMgr.SeatOverrideAnimInfos.length > 0) xml = removeDuplicated("SeatOverrideAnimInfos", xml);
        if (o.CVehicleMetadataMgr.InVehicleOverrideInfos.length > 0) xml = removeDuplicated("InVehicleOverrideInfos", xml);
        if (o.CVehicleMetadataMgr.FirstPersonDriveByLookAroundData.length > 0) xml = removeDuplicated("FirstPersonDriveByLookAroundData", xml);

        fs.writeFileSync(`${getDir()}/output/vehiclelayouts.meta`, xml);
        console.log("Merging all vehiclelayouts.meta files done!".green);
    }
}

function removeDuplicated(name, text) {
    let to_del = [];
    let lines = text.split(/\r?\n/);

    let firstInitData = false;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(`<${name}>`)) {
            if (!firstInitData) firstInitData = true;
            else to_del.push(i);
        }
    }

    firstInitData = false;

    for (let i = lines.length-1; i > 0; i--) {
        if (lines[i].includes(`</${name}>`)) {
            if (!firstInitData) firstInitData = true;
            else to_del.push(i);
        }
    }

    to_del.sort((a, b) => { return b - a });

    for (let i = 0; i < to_del.length; i++) { lines.splice(to_del[i], 1); }

    let x = "";
    for (let i = 0; i < lines.length; i++) { x += `${lines[i].replace("&#xD;", "").replace(` standalone="yes"`, "")}\n`; }

    return x
}

function IsEveryObjectTrue(key_val) {
    let _return = true;

    for (var key of Object.keys(key_val)) {
        if (key_val[key] == false) _return = false;
    }

    return _return;
}

function getDir() {
    if (process.pkg) {
        return path.resolve(process.execPath + "/..");
    } else {
        return path.join(require.main ? require.main.path : process.cwd());
    }
}

function ImportVehiclesMetaFromDir(directory) {
    let e = new Promise(function(resolve, reject) {
        console.log("Importing all vehicles.meta files...".magenta);
        fs.access(directory, (err) => {
            if (err) reject("Directory does not exist!".red);
            else {
                glob("**/vehicles.meta", { cwd: directory } , function (er, files) {
                    if (er) reject(`Error occured during search for a files: ${er}`.red);
                    for (let i = 0; i < files.length; i++) {
                        fs.copyFile(path.join(directory, files[i]), `${getDir()}/vehicles_meta/vehicles${i}.meta`, (err) => {
                            if (err) console.log(`Error occured during coping file:\nFrom: ${path.join(directory, files[i])}\nTo: ${`${getDir()}/vehicles_meta/vehicles${i}.meta`}`.red);
                        });
                    }
                    console.log("Importing all vehicles.meta files done!".magenta);
                    resolve();
                });
            }
        });
    });
    return e;
}

function ImportCarcolsMetaFromDir(directory) {
    let e = new Promise(function(resolve, reject) {
        console.log("Importing all carcols.meta files...".magenta);
        fs.access(directory, (err) => {
            if (err) reject("Directory does not exist!".red);
            else {
                glob("**/carcols.meta", { cwd: directory } , function (er, files) {
                    if (er) reject(`Error occured during search for a files: ${er}`.red);
                    for (let i = 0; i < files.length; i++) {
                        fs.copyFile(path.join(directory, files[i]), `${getDir()}/carcols_meta/carcols${i}.meta`, (err) => {
                            if (err) console.log(`Error occured during coping file:\nFrom: ${path.join(directory, files[i])}\nTo: ${`${getDir()}/carcols_meta/carcols${i}.meta`}`.red);
                        });
                    }
                    console.log("Importing all carcols.meta files done!".magenta);
                    resolve();
                });
            }
        });
    });
    return e;
}

function ImportCarvariationsMetaFromDir(directory) {
    let e = new Promise(function(resolve, reject) {
        console.log("Importing all carvariations.meta files...".magenta);
        fs.access(directory, (err) => {
            if (err) reject("Directory does not exist!".red);
            else {
                glob("**/carvariations.meta", { cwd: directory } , function (er, files) {
                    if (er) reject(`Error occured during search for a files: ${er}`.red);
                    for (let i = 0; i < files.length; i++) {
                        fs.copyFile(path.join(directory, files[i]), `${getDir()}/carvariations_meta/carvariations${i}.meta`, (err) => {
                            if (err) console.log(`Error occured during coping file:\nFrom: ${path.join(directory, files[i])}\nTo: ${`${getDir()}/carvariations_meta/carvariations${i}.meta`}`.red);
                        });
                    }
                    console.log("Importing all carvariations.meta files done!".magenta);
                    resolve();
                });
            }
        });
    });
    return e;
}

function ImportHandlingMetaFromDir(directory) {
    let e = new Promise(function(resolve, reject) {
        console.log("Importing all handling.meta files...".magenta);
        fs.access(directory, (err) => {
            if (err) reject("Directory does not exist!".red);
            else {
                glob("**/handling.meta", { cwd: directory } , function (er, files) {
                    if (er) reject(`Error occured during search for a files: ${er}`.red);
                    for (let i = 0; i < files.length; i++) {
                        fs.copyFile(path.join(directory, files[i]), `${getDir()}/handling_meta/handling${i}.meta`, (err) => {
                            if (err) console.log(`Error occured during coping file:\nFrom: ${path.join(directory, files[i])}\nTo: ${`${getDir()}/handling_meta/handling${i}.meta`}`.red);
                        });
                    }
                    console.log("Importing all handling.meta files done!".magenta);
                    resolve();
                });
            }
        });
    });
    return e;
}

function ImportVehicleLayoutsMetaFromDir(directory) {
    let e = new Promise(function(resolve, reject) {
        console.log("Importing all vehiclelayouts.meta files...".magenta);
        fs.access(directory, (err) => {
            if (err) reject("Directory does not exist!".red);
            else {
                glob("**/vehiclelayouts.meta", { cwd: directory } , function (er, files) {
                    if (er) reject(`Error occured during search for a files: ${er}`.red);
                    for (let i = 0; i < files.length; i++) {
                        fs.copyFile(path.join(directory, files[i]), `${getDir()}/vehiclelayouts_meta/vehiclelayouts${i}.meta`, (err) => {
                            if (err) console.log(`Error occured during coping file:\nFrom: ${path.join(directory, files[i])}\nTo: ${`${getDir()}/vehiclelayouts_meta/vehiclelayouts${i}.meta`}`.red);
                        });
                    }
                    console.log("Importing all vehiclelayouts.meta files done!".magenta);
                    resolve();
                });
            }
        });
    });
    return e;
}

function ImportFileByQueryFromDir() {
    let e = new Promise(function(resolve, reject) {
        rli.question("Path to directory: ", (path_) => {
            fs.access(path_, (err) => {
                if (err) reject("Directory does not exist!".red);
                else {
                    rli.question("Path to directory where to save files: ", (path_2) => {
                        fs.access(path_2, (err2) => {
                            if (err2) reject("Directory does not exist!".red);
                            else {
                                rli.question("Search query: ", (query) => {
                                    glob(query, { cwd: path_ } , function (er, files) {
                                        if (er) reject(`Error occured during search for a files: ${er}`.red);
                                        for (let i = 0; i < files.length; i++) {
                                            let file_path = path.join(path_, files[i]);
                                            let file_name = path.parse(file_path).name;
                                            let file_ext = path.parse(file_path).ext;
                                            let to_path = path.join(path_2, `${file_name}${file_ext}`);
                                            fs.copyFile(file_path, to_path, (err3) => {
                                                if (err3) console.log(`Error occured during coping file:\nFrom: ${file_path}\nTo: ${to_path}`.red);
                                            });
                                        }
                                        console.log(`Importing all files by query: ${query} done!`.magenta);
                                        resolve();
                                    });
                                });
                            }
                        });
                    });
                }
            });
        });
    });
    return e;
}