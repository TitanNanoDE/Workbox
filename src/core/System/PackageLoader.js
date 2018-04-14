import SystemAPI from '../SystemAPI.js';

let PackageLoader = {
    /**
     * @param {function} pack
     */
    bootstrapPackage : function(pack){
        return pack(SystemAPI);
    }
};

export default PackageLoader;
