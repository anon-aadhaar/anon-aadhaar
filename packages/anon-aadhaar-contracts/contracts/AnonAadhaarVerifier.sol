//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "../interfaces/IAnonAadhaarVerifier.sol";

contract AnonAadhaarVerifier {
    address public verifierAddr;
    uint256 public appId;

    uint256 public SNARK_SCALAR_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    uint[32] public ISSUER_MODULUS = [7873437550307926165, 13477973865601442634, 1458039844062964693, 7398834103216365279, 12384545621709803393, 14386943674931866539, 2263535879398593693, 3600615314669141235, 13096864295899435543, 8628516684870087465, 343547845356630073, 10551339838260165529, 10902964543149146524, 4056605863534888131, 17764439819646281378, 5137209503034180614, 2378644744463171581, 6676194234629029970, 5432490752817224179, 12846544745292400088 , 3434369281354788863, 1533621309896666264, 18225262974130476508, 10073981006187788275, 8114837903070988230, 7632965149656839367, 2714276348828835947, 615665516684210923, 1084184375765016924, 17345989530239433420, 8106155243977228977, 11705466821727348154];

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