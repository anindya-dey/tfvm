import fs from "fs";

import { STORAGE_DIR } from "../configs";
import { printSuccess, printError, printInfo } from "../utils";

type RemoveOptions = {
    version: string;
    all: boolean
}

const remove = (opts: any) => {
    printInfo(JSON.stringify(opts, null, 4));
};

export default remove;
