import { describe } from "mocha"
import { IdentityPCDArgs, PCDInitArgs } from "../../src/types"
import { init, prove, verify } from "../../src/pcd"
import { assert } from "chai"


describe("PCD tests", function() {
    this.timeout(0);
    it("PCD flow", async () => {
        let pcdInitArgs: PCDInitArgs = {
            wasmFilePath: "",
            zkeyFilePath: "",
            verificationKeyFilePath: ""
        }

        await init(pcdInitArgs);

        let pcdArgs: IdentityPCDArgs = {
            exp: BigInt(65337), 
            message: BigInt(""),
            mod: BigInt(""),
            signature: BigInt("")
        }

        let pcd = await prove(pcdArgs);
        
        let verified = await verify(pcd);
        assert(verified == true, "Should verifiable");
    })
})  