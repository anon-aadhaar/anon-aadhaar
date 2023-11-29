//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "../interfaces/IAnonAadhaarVerifier.sol";

contract AnonAadhaarVerifier {
    address public verifierAddr;
    uint256 public appId;

    uint256 public SNARK_SCALAR_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    // Production public key
    // uint[32] public ISSUER_MODULUS = [7873437550307926165, 13477973865601442634, 1458039844062964693, 7398834103216365279, 12384545621709803393, 14386943674931866539, 2263535879398593693, 3600615314669141235, 13096864295899435543, 8628516684870087465, 343547845356630073, 10551339838260165529, 10902964543149146524, 4056605863534888131, 17764439819646281378, 5137209503034180614, 2378644744463171581, 6676194234629029970, 5432490752817224179, 12846544745292400088 , 3434369281354788863, 1533621309896666264, 18225262974130476508, 10073981006187788275, 8114837903070988230, 7632965149656839367, 2714276348828835947, 615665516684210923, 1084184375765016924, 17345989530239433420, 8106155243977228977, 11705466821727348154];
    // Test PDF public key
    uint[32] public ISSUER_MODULUS = [ 14802194023203656093, 2804169383069916853, 496991132330559339, 2044134272263249048, 9625896386217978454, 10967403457044780298, 9775317524806066771, 5561505371079494480, 10560300512109825190, 16129190325487635890, 18001156251078908687, 461092412729958323, 6331149421243581141, 11783897075401707273, 15565812337639205350, 523229610772846347, 17536660578867199836, 7115144006388206192, 9426479877521167481, 916998618954199186, 16523613292178382716, 1357861234386200203, 2235444405695526401, 12616767850953148350, 2427846810430325147, 4335594182981949182, 841809897173675580, 8675485891104175248, 7117022419685452177, 14807249288786766117, 12897977216031951370, 15399447716523847189];

    constructor(address _verifierAddr, uint256 _appId) {
        require(_appId < SNARK_SCALAR_FIELD, "AnonAadhaarVerifier: group id must be < SNARK_SCALAR_FIELD");
        appId = _appId;
        verifierAddr = _verifierAddr;
    }

    function verifyModulus(uint[] memory _inputModulus) private view returns (bool) {
        bool isValid = true;
        for (uint i = 0; i < 32; i++) {
            if (_inputModulus[i] != ISSUER_MODULUS[i]) isValid = false;
        }
        return isValid;
    }

    function slice(uint256[34] memory data, uint256 start) public pure returns (uint256[] memory) {
        uint256[] memory sliced = new uint256[](32);
        
        for (uint256 i = 0; i < 32; i++) {
            sliced[i] = data[start + i];
        }
        
        return sliced;
    }

    function verifyProof(
        uint[2] calldata a, 
        uint[2][2] calldata b, 
        uint[2] calldata c, 
        uint[34] calldata input
    ) public view returns (bool) {
        require(input[input.length - 1] == appId, "AnonAadhaarVerifier: wrong app ID");
        uint256[] memory inputModulus = slice(input, 1);
        require(verifyModulus(inputModulus) == true, "AnonAadhaarVerifier: wrong issuer public key");
        return IAnonAadhaarVerifier(verifierAddr).verifyProof(a, b, c, input);
    }
}